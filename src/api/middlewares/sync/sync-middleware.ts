import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { NotFoundError } from "../../../domain/errors/errors";
import { User } from "../../../infrastructure/entities/User"
import { SolarUnit } from "../../../infrastructure/entities/SolarUnit";
import { EnergyGenerationRecord } from "../../../infrastructure/entities/EnergyGenerationRecord";
import { z } from "zod";

// Shared Schema definitions (mirrored from background job)
const BulkRecordSchema = z.object({
    serialNumber: z.string(),
    energyGenerated: z.number(),
    timestamp: z.string(),
    intervalHours: z.number(),
});

const BulkResponseItemSchema = z.object({
    serialNumber: z.string(),
    records: z.array(BulkRecordSchema),
    error: z.string().optional(),
});

const BulkResponseSchema = z.object({
    results: z.array(BulkResponseItemSchema),
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
            return next();
        }

        // 1. Identify units that need syncing (older than 10 minutes)
        // Reduced from 2 hours to 10 minutes to allow near-realtime updates when user logs in
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const unitsToSync = solarUnits.filter(unit => {
            return !unit.lastSyncedAt || unit.lastSyncedAt < tenMinutesAgo;
        });

        if (unitsToSync.length === 0) {
            return next();
        }

        // 2. Mark them as syncing (Atomic-ish update to prevent immediate re-syncs from other tabs)
        const unitIds = unitsToSync.map(u => u._id);
        await SolarUnit.updateMany(
            { _id: { $in: unitIds } },
            { $set: { lastSyncedAt: new Date() } }
        );

        // 3. Prepare Payload
        const bulkRequestPayload = await Promise.all(unitsToSync.map(async (unit) => {
            const lastSyncedRecord = await EnergyGenerationRecord
                .findOne({ solarUnitId: unit._id })
                .sort({ timestamp: -1 });

            return {
                serialNumber: unit.serialNumber,
                since: lastSyncedRecord?.timestamp?.toISOString(),
                _internalUnitId: unit._id
            };
        }));

        // 4. Send Bulk Request
        const rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
        const dataApiUrl = rawUrl.replace(/\/$/, "");
        const url = `${dataApiUrl}/api/energy-generation-records/bulk-fetch`;

        const apiPayload = bulkRequestPayload.map(({ _internalUnitId, ...rest }) => rest);

        let dataAPIResponse;
        try {
            dataAPIResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://voltaris-solar-dashboard.onrender.com/"
                },
                body: JSON.stringify(apiPayload)
            });
        } catch (error) {
            console.error(`[SyncMiddleware] Failed to connect to Data API at ${url}`, error);
            // We already updated lastSyncedAt, so it will retry in 2 hours.
            return next();
        }

        if (!dataAPIResponse.ok) {
            console.warn(`[SyncMiddleware] Data API error: ${dataAPIResponse.status}`);
            return next();
        }

        // 5. Process Response
        const json = await dataAPIResponse.json();
        const parsedResponse = BulkResponseSchema.safeParse(json);

        if (!parsedResponse.success) {
            console.error("[SyncMiddleware] Invalid response", parsedResponse.error);
            return next();
        }

        const results = parsedResponse.data.results;

        for (const result of results) {
            if (result.records.length === 0) continue;

            const unitInfo = bulkRequestPayload.find(p => p.serialNumber === result.serialNumber);
            if (!unitInfo) continue;

            const recordsToInsert = result.records.map(record => ({
                solarUnitId: unitInfo._internalUnitId,
                energyGenerated: record.energyGenerated,
                timestamp: new Date(record.timestamp),
                intervalHours: record.intervalHours,
            }));

            try {
                await EnergyGenerationRecord.insertMany(recordsToInsert, { ordered: false });
                console.log(`[SyncMiddleware] Synced ${recordsToInsert.length} records for ${result.serialNumber}`);
            } catch (err: any) {
                if (err.code !== 11000) {
                    console.error(`[SyncMiddleware] Insert error ${result.serialNumber}:`, err);
                }
            }
        }

        next();
    } catch (error) {
        console.error("Sync middleware error:", error);
        next(error);
    }
};