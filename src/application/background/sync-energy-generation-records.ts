import { z } from "zod";
import { EnergyGenerationRecord } from "../../infrastructure/entities/EnergyGenerationRecord";
import { SolarUnit } from "../../infrastructure/entities/SolarUnit";
import { AnomalyDetectionService } from "../services/anomaly.service";

export const DataAPIEnergyGenerationRecordDto = z.object({
    _id: z.string(),
    serialNumber: z.string(),
    energyGenerated: z.number(),
    timestamp: z.string(),
    intervalHours: z.number(),
    __v: z.number(),
});

/**
 * Synchronizes energy generation records from the data API
 * Fetches latest records and merges new data with existing records
 */

const processSolarUnit = async (solarUnit: any) => {
    try {
        let hasMoreData = true;
        let batchCount = 0;
        const BATCH_LIMIT = 1000; // Must match Data API limit

        while (hasMoreData) {
            // Get latest synced timestamp (refreshed on every loop iteration)
            const lastSyncedRecord = await EnergyGenerationRecord
                .findOne({ solarUnitId: solarUnit._id })
                .sort({ timestamp: -1 });

            // Build URL
            const rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
            const dataApiUrl = rawUrl.replace(/\/$/, "");
            const url = new URL(`${dataApiUrl}/api/energy-generation-records/solar-unit/${solarUnit.serialNumber}`);

            if (lastSyncedRecord?.timestamp) {
                url.searchParams.append('sinceTimestamp', lastSyncedRecord.timestamp.toISOString());
            }

            // Fetch latest records from data API
            // Add Cloudflare bypass headers
            const dataAPIResponse = await fetch(url.toString(), {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                }
            });

            if (!dataAPIResponse.ok) {
                console.warn(`Failed to fetch energy records for ${solarUnit.serialNumber}: ${dataAPIResponse.statusText}`);
                hasMoreData = false; // Stop loop on error
                break;
            }

            const newRecords = DataAPIEnergyGenerationRecordDto
                .array()
                .parse(await dataAPIResponse.json());

            if (newRecords.length > 0) {
                // Transform API records to match schema
                const recordsToInsert = newRecords.map(record => ({
                    solarUnitId: solarUnit._id,
                    energyGenerated: record.energyGenerated,
                    timestamp: new Date(record.timestamp),
                    intervalHours: record.intervalHours,
                }));

                await EnergyGenerationRecord.insertMany(recordsToInsert);

                batchCount++;
                console.log(`[Sync] Batch ${batchCount}: Synced ${recordsToInsert.length} records for ${solarUnit.serialNumber}`);

                // Trigger Anomaly Detection
                const anomalyService = new AnomalyDetectionService();
                await anomalyService.analyzeRecords(recordsToInsert);

                // If we received fewer records than the limit, we are caught up
                if (newRecords.length < BATCH_LIMIT) {
                    hasMoreData = false;
                }
                // Otherwise, loop again immediately to get the next 1000
            } else {
                console.log(`[Sync] No new records for ${solarUnit.serialNumber}`);
                hasMoreData = false;
            }
        }
    } catch (error) {
        console.error(`Error processing solar unit ${solarUnit.serialNumber}:`, error);
    }
};

/**
 * Synchronizes energy generation records from the data API
 * Fetches latest records and merges new data with existing records
 */
export const syncEnergyGenerationRecords = async (specificSolarUnitId?: string) => {
    try {
        const query = specificSolarUnitId ? { _id: specificSolarUnitId } : {};
        const solarUnits = await SolarUnit.find(query);

        // Process SEQUENTIALLY to avoid hitting Data API rate limits (429)
        // especially on startup when syncing all units.
        console.log(`[Sync Job] Found ${solarUnits.length} solar units to sync.`);

        for (const unit of solarUnits) {
            await processSolarUnit(unit);
            // Add a small delay between units to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

    } catch (error) {
        console.error("Sync Job error:", error);
    }
};