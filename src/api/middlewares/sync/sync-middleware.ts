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

        const solarUnits = await SolarUnit.find({ userId: user._id });
        if (!solarUnits || solarUnits.length === 0) {
            // No solar units found, skip sync
            return next();
        }

        // Process all solar units in parallel
        await Promise.all(solarUnits.map(async (solarUnit) => {
            try {
                // Atomic rate limit check: Try to update lastSyncedAt if it's older than 2 hours
                // This prevents race conditions where multiple parallel requests trigger the sync
                const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

                const updateResult = await SolarUnit.updateOne(
                    {
                        _id: solarUnit._id,
                        $or: [
                            { lastSyncedAt: { $exists: false } },
                            { lastSyncedAt: null },
                            { lastSyncedAt: { $lt: twoHoursAgo } }
                        ]
                    },
                    { $set: { lastSyncedAt: new Date() } }
                );

                if (updateResult.modifiedCount === 0) {
                    // Another request already triggered the sync or it's too soon
                    return;
                }

                // Fetch latest records from data API
                const rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
                const dataApiUrl = rawUrl.replace(/\/$/, "");
                const url = `${dataApiUrl}/api/energy-generation-records/solar-unit/${solarUnit.serialNumber}`;

                let dataAPIResponse;
                try {
                    dataAPIResponse = await fetch(url, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Accept": "application/json",
                            "Accept-Language": "en-US,en;q=0.9",
                        }
                    });
                } catch (error) {
                    console.error(`[SyncMiddleware] Failed to connect to Data API at ${url}`, error);
                    // Note: lastSyncedAt was already updated, so we won't retry for 2 hours.
                    return;
                }

                if (!dataAPIResponse.ok) {
                    const respText = await dataAPIResponse.text().catch(() => "<unreadable>");
                    console.warn(`[SyncMiddleware] Data API returned error: ${dataAPIResponse.status} - ${respText}`);
                    return;
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
                    console.log(`Synced ${recordsToInsert.length} new energy generation records for unit ${solarUnit.serialNumber}`);
                } else {
                    console.log(`No new records to sync for unit ${solarUnit.serialNumber}`);
                }
            } catch (err) {
                console.error(`[SyncMiddleware] Error syncing unit ${solarUnit.serialNumber}:`, err);
            }
        }));

        next();
    } catch (error) {
        console.error("Sync middleware error:", error);
        next(error);
    }
};