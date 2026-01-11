import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { NotFoundError } from "../../../domain/errors/errors";
import { User } from "../../../infrastructure/entities/User"
import { SolarUnit } from "../../../infrastructure/entities/SolarUnit";
import { EnergyGenerationRecord } from "../../../infrastructure/entities/EnergyGenerationRecord";

import { z } from "zod";

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
export const syncMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const auth = getAuth(req);
        const user = await User.findOne({ clerkUserId: auth.userId });
        if (!user) {
            throw new NotFoundError("User not found");
        }

        const solarUnit = await SolarUnit.findOne({ userId: user._id });
        if (!solarUnit) {
            throw new NotFoundError("Solar unit not found");
        }

        // Fetch latest records from data API
        // Fetch latest records from data API
        const rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
        const dataApiUrl = rawUrl.replace(/\/$/, "");
        const url = `${dataApiUrl}/api/energy-generation-records/solar-unit/${solarUnit.serialNumber}`;

        let dataAPIResponse;
        try {
            dataAPIResponse = await fetch(url);
        } catch (error) {
            console.error(`[SyncMiddleware] Failed to connect to Data API at ${url}`, error);
            // Verify if non-critical: currently we treat sync failure as non-critical for dashboard loading
            return next();
        }

        if (!dataAPIResponse.ok) {
            const respText = await dataAPIResponse.text().catch(() => "<unreadable>");
            console.warn(`[SyncMiddleware] Data API returned error: ${dataAPIResponse.status} - ${respText}`);
            return next();
        }

        const latestEnergyGenerationRecords = DataAPIEnergyGenerationRecordDto
            .array()
            .parse(await dataAPIResponse.json());

        // Get latest synced timestamp to only fetch new data
        const lastSyncedRecord = await EnergyGenerationRecord
            .findOne({ solarUnitId: solarUnit._id })
            .sort({ timestamp: -1 });

        // Filter records that are new (not yet in database)
        const newRecords = latestEnergyGenerationRecords.filter(apiRecord => {
            if (!lastSyncedRecord) return true; // First sync, add all
            return new Date(apiRecord.timestamp) > lastSyncedRecord.timestamp;
        });

        if (newRecords.length > 0) {
            // Transform API records to match schema
            const recordsToInsert = newRecords.map(record => ({
                solarUnitId: solarUnit._id,
                energyGenerated: record.energyGenerated,
                timestamp: new Date(record.timestamp),
                intervalHours: record.intervalHours,
            }));

            await EnergyGenerationRecord.insertMany(recordsToInsert);
            console.log(`Synced ${recordsToInsert.length} new energy generation records`);
        } else {
            console.log("No new records to sync");
        }

        next();
    } catch (error) {
        console.error("Sync middleware error:", error);
        next(error);
    }
};