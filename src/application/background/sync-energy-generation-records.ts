import { z } from "zod";
import { EnergyGenerationRecord } from "../../infrastructure/entities/EnergyGenerationRecord";
import { SolarUnit } from "../../infrastructure/entities/SolarUnit";
import { AnomalyDetectionService } from "../services/anomaly.service";

// Schema for individual records in the bulk response
const BulkRecordSchema = z.object({
    serialNumber: z.string(),
    energyGenerated: z.number(),
    timestamp: z.string(),
    intervalHours: z.number(),
});

// Schema for the bulk response item
const BulkResponseItemSchema = z.object({
    serialNumber: z.string(),
    records: z.array(BulkRecordSchema),
    error: z.string().optional(),
});

const BulkResponseSchema = z.object({
    results: z.array(BulkResponseItemSchema),
});

/**
 * Synchronizes energy generation records from the data API using Bulk Fetch
 */
/**
 * Synchronizes energy generation records with robust retry and fallback mechanisms
 */
export const syncEnergyGenerationRecords = async (specificSolarUnitId?: string) => {
    try {
        const query = specificSolarUnitId ? { _id: specificSolarUnitId } : {};
        const solarUnits = await SolarUnit.find(query);

        if (solarUnits.length === 0) return;

        console.log(`[Sync Job] Preparing to sync ${solarUnits.length} solar units...`);

        // 1. Prepare Request Payload (Metadata for what we need)
        const requestMetadata = await Promise.all(solarUnits.map(async (unit) => {
            const lastSyncedRecord = await EnergyGenerationRecord
                .findOne({ solarUnitId: unit._id })
                .sort({ timestamp: -1 });

            return {
                serialNumber: unit.serialNumber,
                since: lastSyncedRecord?.timestamp?.toISOString(),
                _internalUnitId: unit._id
            };
        }));

        const apiPayload = requestMetadata.map(({ _internalUnitId, ...rest }) => rest);

        // STRATEGY 1 & 2: Bulk Sync with Exponential Backoff
        // Retries: 0s, 2s, 4s, 8s (Max 3 retries)
        const MAX_BULK_RETRIES = 3;
        let bulkSuccess = false;

        for (let attempt = 0; attempt <= MAX_BULK_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`[Sync Job] Bulk sync retry ${attempt}/${MAX_BULK_RETRIES} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                bulkSuccess = await executeBulkSync(apiPayload, requestMetadata);
                if (bulkSuccess) break;

            } catch (error) {
                console.warn(`[Sync Job] Bulk attempt ${attempt + 1} failed:`, error);
            }
        }

        // STRATEGY 3: Fallback to Sequential Sync (Stealth Mode)
        if (!bulkSuccess) {
            console.warn("[Sync Job] Bulk sync exhausted. Falling back to SEQUENTIAL INDIVIDUAL SYNC (Stealth Mode).");
            await executeFallbackSequentialSync(requestMetadata);
        }

    } catch (error) {
        console.error("Sync Job Critical Error:", error);
    }
};

/**
 * Executes a single bulk sync attempt
 * Returns true if successful, false if rate limited or failed
 */
async function executeBulkSync(apiPayload: any[], unitMetadata: any[]): Promise<boolean> {
    const rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
    const dataApiUrl = rawUrl.replace(/\/$/, "");
    const url = `${dataApiUrl}/api/energy-generation-records/bulk-fetch`;

    console.log(`[Sync Job] Sending bulk request to ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                // Honest Identity + Referer to bypass WAF
                "User-Agent": "Voltaris-Solar-Backend/1.0",
                "Referer": "https://voltaris-solar-dashboard.onrender.com/"
            },
            body: JSON.stringify(apiPayload)
        });

        if (!response.ok) {
            console.error(`[Sync Job] Bulk Fetch failed: ${response.status} - ${response.statusText}`);
            return false;
        }

        const json = await response.json();
        const parsedResponse = BulkResponseSchema.safeParse(json);

        if (!parsedResponse.success) {
            console.error("[Sync Job] Invalid bulk response format", parsedResponse.error);
            // If format is wrong, retrying might not help, but let's return false to trigger fallback just in case
            return false;
        }

        await processBulkResults(parsedResponse.data.results, unitMetadata);
        return true;

    } catch (error) {
        console.error("[Sync Job] Network error during bulk sync:", error);
        return false;
    }
}

/**
 * Connects data from API response to our Database
 */
async function processBulkResults(results: any[], unitMetadata: any[]) {
    const anomalyService = new AnomalyDetectionService();
    let totalSynced = 0;

    for (const result of results) {
        if (result.error || result.records.length === 0) continue;

        const unitInfo = unitMetadata.find(p => p.serialNumber === result.serialNumber);
        if (!unitInfo) continue;

        await saveRecords(result.records, unitInfo._internalUnitId, anomalyService);
        totalSynced += result.records.length;
    }
    console.log(`[Sync Job] Bulk Sync Completed. Total records: ${totalSynced}`);
}

/**
 * Fallback: Syncs units one by one with a delay to avoid rate limits
 */
async function executeFallbackSequentialSync(unitMetadata: any[]) {
    const rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
    const dataApiUrl = rawUrl.replace(/\/$/, "");
    const anomalyService = new AnomalyDetectionService();

    for (const unit of unitMetadata) {
        const url = `${dataApiUrl}/api/energy-generation-records/solar-unit/${unit.serialNumber}?sinceTimestamp=${unit.since || ''}`;

        try {
            // Polite delay between requests
            await new Promise(r => setTimeout(r, 2000));

            console.log(`[Fallback Sync] Fetching ${unit.serialNumber}...`);
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Voltaris-Solar-Backend/1.0",
                    "Referer": "https://voltaris-solar-dashboard.onrender.com/"
                }
            });

            if (response.status === 429) {
                console.warn(`[Fallback Sync] 429 for ${unit.serialNumber}. Waiting 10s...`);
                await new Promise(r => setTimeout(r, 10000));
                continue; // Skip this unit, try next
            }

            if (!response.ok) {
                console.error(`[Fallback Sync] Failed ${unit.serialNumber}: ${response.status}`);
                continue;
            }

            const records = await response.json();
            if (Array.isArray(records) && records.length > 0) {
                // Map individual response format (which might be raw DB records) to our usage
                // Assuming individual endpoint returns array of objects with energyGenerated, timestamp etc.
                await saveRecords(records, unit._internalUnitId, anomalyService);
                console.log(`[Fallback Sync] Saved ${records.length} records for ${unit.serialNumber}`);
            }

        } catch (error) {
            console.error(`[Fallback Sync] Error for ${unit.serialNumber}:`, error);
        }
    }
    console.log("[Fallback Sync] Completed.");
}

/**
 * Helper to save records and run anomaly detection
 */
async function saveRecords(rawRecords: any[], unitId: any, anomalyService: AnomalyDetectionService) {
    const recordsToInsert = rawRecords.map((record: any) => ({
        solarUnitId: unitId,
        energyGenerated: record.energyGenerated,
        timestamp: new Date(record.timestamp),
        intervalHours: record.intervalHours || 2, // Default if missing in individual response
    }));

    try {
        await EnergyGenerationRecord.insertMany(recordsToInsert, { ordered: false });
        await anomalyService.analyzeRecords(recordsToInsert);
    } catch (err: any) {
        if (err.code !== 11000) {
            console.error(`[DB] Insert Error:`, err);
        }
    }
}