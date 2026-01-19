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
export const syncEnergyGenerationRecords = async (specificSolarUnitId?: string) => {
    try {
        const query = specificSolarUnitId ? { _id: specificSolarUnitId } : {};
        const solarUnits = await SolarUnit.find(query);

        if (solarUnits.length === 0) return;

        console.log(`[Sync Job] Preparing to sync ${solarUnits.length} solar units...`);

        // 1. Prepare Bulk Request Payload
        // We need to find the specific 'since' timestamp for EACH unit
        const bulkRequestPayload = await Promise.all(solarUnits.map(async (unit) => {
            const lastSyncedRecord = await EnergyGenerationRecord
                .findOne({ solarUnitId: unit._id })
                .sort({ timestamp: -1 });

            return {
                serialNumber: unit.serialNumber,
                since: lastSyncedRecord?.timestamp?.toISOString(),
                // Keep a reference to the unit ID for later insertion
                _internalUnitId: unit._id
            };
        }));

        // 2. Send Bulk Request
        const rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
        const dataApiUrl = rawUrl.replace(/\/$/, "");
        const url = `${dataApiUrl}/api/energy-generation-records/bulk-fetch`;

        console.log(`[Sync Job] Sending bulk sync request to ${url}`);

        // Sanitize payload (remove internal ID before sending)
        const apiPayload = bulkRequestPayload.map(({ _internalUnitId, ...rest }) => rest);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Voltaris-Solar-Backend/1.0",
                "Referer": "https://voltaris-solar-dashboard.onrender.com/"
            },
            body: JSON.stringify(apiPayload)
        });

        if (!response.ok) {
            console.error(`[Sync Job] Data API Check failed: ${response.status} - ${response.statusText}`);
            return;
        }

        const json = await response.json();
        const parsedResponse = BulkResponseSchema.safeParse(json);

        if (!parsedResponse.success) {
            console.error("[Sync Job] Invalid bulk response format", parsedResponse.error);
            return;
        }

        // 3. Process Response
        const results = parsedResponse.data.results;
        const anomalyService = new AnomalyDetectionService();
        let totalRecordsSynced = 0;

        for (const result of results) {
            if (result.error) {
                console.error(`[Sync Job] Error for unit ${result.serialNumber}: ${result.error}`);
                continue;
            }

            if (result.records.length === 0) {
                continue;
            }

            // Find the matching unit ID
            const unitInfo = bulkRequestPayload.find(p => p.serialNumber === result.serialNumber);
            if (!unitInfo) continue;

            const recordsToInsert = result.records.map(record => ({
                solarUnitId: unitInfo._internalUnitId,
                energyGenerated: record.energyGenerated,
                timestamp: new Date(record.timestamp),
                intervalHours: record.intervalHours,
            }));

            // Insert records
            // Use unordered insert to ignore duplicate keys if any overlap occurs
            try {
                await EnergyGenerationRecord.insertMany(recordsToInsert, { ordered: false });

                totalRecordsSynced += recordsToInsert.length;
                console.log(`[Sync Job] Synced ${recordsToInsert.length} new records for ${result.serialNumber}`);

                // Trigger Anomaly Detection
                await anomalyService.analyzeRecords(recordsToInsert);

            } catch (err: any) {
                // Ignore duplicate key errors (code 11000)
                if (err.code !== 11000) {
                    console.error(`[Sync Job] DB Insert Error for ${result.serialNumber}:`, err);
                }
            }
        }

        console.log(`[Sync Job] Completed. Total records synced: ${totalRecordsSynced}`);

    } catch (error) {
        console.error("Sync Job error:", error);
    }
};