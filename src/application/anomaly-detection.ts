import { Anomaly } from "../infrastructure/entities/Anomaly";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import mongoose from "mongoose";
import { subDays, startOfDay } from "date-fns";

export class AnomalyDetectionService {

    /**
     * Main entry point to analyze a batch of new energy records.
     * @param newRecords Array of EnergyGenerationRecord documents or objects.
     */
    static async analyzeRecords(newRecords: any[]) {
        if (!newRecords || newRecords.length === 0) return;

        console.log(`[AnomalyDetection] Analyzing ${newRecords.length} records...`);

        // Group records by solar unit to process contextually
        const unitMap = new Map<string, any[]>();
        for (const r of newRecords) {
            const uid = r.solarUnitId.toString();
            if (!unitMap.has(uid)) unitMap.set(uid, []);
            unitMap.get(uid)?.push(r);
        }

        for (const [unitId, records] of Array.from(unitMap.entries())) {
            // Sort recs by timestamp ascending
            records.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            await this.detectInstantaneousAnomalies(unitId, records);
            await this.detectDegradation(unitId);
        }
    }

    private static async detectInstantaneousAnomalies(unitId: string, records: any[]) {
        for (let i = 0; i < records.length; i++) {
            const current = records[i];
            const date = new Date(current.timestamp);
            const hour = date.getUTCHours();
            const energy = current.energyGenerated;

            // ---------------------------------------------------------
            // 1. ZERO GENERATION (Critical)
            // "Check if energy < 5 kWh between 10:00 AM – 2:00 PM."
            // ---------------------------------------------------------
            if (hour >= 10 && hour <= 14 && energy < 5) {
                await this.createAnomalyIfNotExists(unitId, 'ZERO_GENERATION', 'CRITICAL', date,
                    "Zero output detected during peak sunlight hours",
                    { expectedValue: 200, actualValue: energy, deviationPercent: 100 }
                );
            }

            // ---------------------------------------------------------
            // 2. SUDDEN DROP & 3. ERRATIC FLUCTUATION
            // Requires context of previous record. 
            // Note: In a real stream, we'd query the DB for the "last record before this batch". 
            // For this simulation, we check within the batch or fetch the latest from DB if i=0.
            // ---------------------------------------------------------
            let prev = null;
            if (i > 0) {
                prev = records[i - 1];
            } else {
                // Try to fetch the very last record before this batch
                prev = await EnergyGenerationRecord.findOne({
                    solarUnitId: unitId,
                    timestamp: { $lt: date }
                }).sort({ timestamp: -1 });
            }

            if (prev) {
                const prevDate = new Date(prev.timestamp);
                // Ensure consecutive (within ~2.5 hours to account for 2h intervals)
                const diffMs = date.getTime() - prevDate.getTime();
                const hoursDiff = diffMs / (1000 * 60 * 60);

                if (hoursDiff <= 3) {
                    // 2. SUDDEN DROP (Warning)
                    // "current < prev * 0.5" during daylight (8-16)
                    if (hour >= 8 && hour <= 16) {
                        if (prev.energyGenerated > 20 && energy < (prev.energyGenerated * 0.5)) {
                            await this.createAnomalyIfNotExists(unitId, 'SUDDEN_DROP', 'WARNING', date,
                                `Sudden >50% drop in output (From ${prev.energyGenerated} to ${energy} kWh)`,
                                { expectedValue: prev.energyGenerated, actualValue: energy, deviationPercent: 50 }
                            );
                        }
                    }

                    // 3. ERRATIC FLUCTUATION (Warning)
                    // "Hourly changes > 100%" (Spike)
                    // If current > prev * 2
                    if (prev.energyGenerated > 10 && energy > (prev.energyGenerated * 2)) {
                        // Spike
                        await this.createAnomalyIfNotExists(unitId, 'ERRATIC_FLUCTUATION', 'WARNING', date,
                            `Abnormal energy spike (>100% increase from ${prev.energyGenerated} to ${energy} kWh)`,
                            { expectedValue: prev.energyGenerated, actualValue: energy, deviationPercent: 100 }
                        );
                    }
                }
            }
        }
    }

    private static async detectDegradation(unitId: string) {
        // ---------------------------------------------------------
        // 4. PERFORMANCE DEGRADATION (Info)
        // "Check if 7-Day-Avg < (30-Day-Avg * 0.85)."
        // ---------------------------------------------------------

        const today = new Date();
        // Only check once per day? 
        // We'll check based on the LAST record timestamp in the batch to simulate "current time"?
        // Or just use real time. PRD says 'active diagnostic system'.

        // Check if we already evaluated this today
        const startOfToday = startOfDay(today);
        const existing = await Anomaly.findOne({
            solarUnitId: unitId,
            anomalyType: 'PERFORMANCE_DEGRADATION',
            detectionTimestamp: { $gte: startOfToday }
        });
        if (existing) return;

        const sevenDaysAgo = subDays(today, 7);
        const thirtyDaysAgo = subDays(today, 30);

        // Get 7 day avg
        const avg7 = await this.getAverageEnergy(unitId, sevenDaysAgo, today);

        // Get 30 day avg
        const avg30 = await this.getAverageEnergy(unitId, thirtyDaysAgo, today);

        if (avg30 > 50 && avg7 < (avg30 * 0.85)) { // Threshold >50 to avoid noise at night/low gen
            const deviation = Math.round(((avg30 - avg7) / avg30) * 100);
            await this.createAnomalyIfNotExists(unitId, 'PERFORMANCE_DEGRADATION', 'INFO', today,
                `7-Day average (${Math.round(avg7)}kWh) is ${deviation}% lower than 30-Day average (${Math.round(avg30)}kWh)`,
                { expectedValue: Math.round(avg30), actualValue: Math.round(avg7), deviationPercent: deviation }
            );
        }
    }

    private static async getAverageEnergy(unitId: string, startDate: Date, endDate: Date): Promise<number> {
        const result = await EnergyGenerationRecord.aggregate([
            {
                $match: {
                    solarUnitId: new mongoose.Types.ObjectId(unitId),
                    timestamp: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    // We want daily total average? Or hourly average?
                    // PRD: "7-Day-Avg". Usually implies Daily Energy Average.
                    // But our records are 2-hours.
                    // Let's sum by day first? 
                    // Simplest interpretation: Average of all records in that period? No, that varies by number of records.
                    // Let's do Average Daily Sum.

                    // However, "metrics: { expectedValue... }" implies simple number.
                    // Let's just take the average of 'energyGenerated' per record for now to keep it apples-to-apples.
                    avgEnergy: { $avg: "$energyGenerated" }
                }
            }
        ]);
        return result.length ? result[0].avgEnergy : 0;
    }

    private static async createAnomalyIfNotExists(
        unitId: string,
        type: string,
        severity: string,
        timestamp: Date,
        desc: string,
        metrics: any
    ) {
        // Check for duplicate alert for same timestamp/type to avoid spamming
        const exists = await Anomaly.findOne({
            solarUnitId: unitId,
            anomalyType: type,
            detectionTimestamp: timestamp
        });

        if (!exists) {
            await Anomaly.create({
                solarUnitId: unitId,
                anomalyType: type,
                severity,
                detectionTimestamp: timestamp,
                description: desc,
                metrics,
                status: 'NEW'
            });
            console.log(`[AnomalyDetection] Created ${severity} alert: ${type} at ${timestamp.toISOString()}`);
        }
    }
}
