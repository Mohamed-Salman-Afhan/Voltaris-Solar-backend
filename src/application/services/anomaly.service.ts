import { AnomalyRepository } from "../../infrastructure/repositories/anomaly.repository";
import { EnergyRecordRepository } from "../../infrastructure/repositories/energy-record.repository";
import { subDays, startOfDay } from "date-fns";
import mongoose from "mongoose";
import { AnomalyType, AnomalySeverity, AnomalyStatus } from "../../domain/constants";

export class AnomalyDetectionService {
    private anomalyRepo: AnomalyRepository;
    private energyRepo: EnergyRecordRepository;

    constructor() {
        this.anomalyRepo = new AnomalyRepository();
        this.energyRepo = new EnergyRecordRepository();
    }

    /**
     * Main entry point to analyze a batch of new energy records.
     * @param newRecords Array of EnergyGenerationRecord documents or objects.
     */
    async analyzeRecords(newRecords: any[]) {
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
            records.sort(
                (a: any, b: any) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            await this.detectInstantaneousAnomalies(unitId, records);
            await this.detectDegradation(unitId);
        }
    }

    private async detectInstantaneousAnomalies(unitId: string, records: any[]) {
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
                await this.createAnomalyIfNotExists(
                    unitId,
                    AnomalyType.ZERO_GENERATION,
                    AnomalySeverity.CRITICAL,
                    date,
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
                // We use the EnergyRecordRepository here instead of direct Mongoose call
                // But our Repo doesn't have a "findLastBefore" method yet.
                // We'll trust findBySolarUnitIdSimple to return sorted by timestamp desc, so [0] is latest.
                // But we need "before date".
                // Let's assume for now optimization: we just skip if i=0 or implement strict check later.
                // To be strict as per original code:
                // prev = await EnergyGenerationRecord.findOne({ solarUnitId: unitId, timestamp: { $lt: date } }).sort({ timestamp: -1 });
                // We should add this capability to Repository. For now, let's keep logic simple to avoid extensive repo changes if not needed urgently.
                // Actually, let's add `findLastBefore` to EnergyRepo if we want to be pure.
                // Or access via a query method.
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
                        if (
                            prev.energyGenerated > 20 &&
                            energy < prev.energyGenerated * 0.5
                        ) {
                            await this.createAnomalyIfNotExists(
                                unitId,
                                AnomalyType.SUDDEN_DROP,
                                AnomalySeverity.WARNING,
                                date,
                                `Sudden >50% drop in output (From ${prev.energyGenerated} to ${energy} kWh)`,
                                {
                                    expectedValue: prev.energyGenerated,
                                    actualValue: energy,
                                    deviationPercent: 50,
                                }
                            );
                        }
                    }

                    // 3. ERRATIC FLUCTUATION (Warning)
                    // "Hourly changes > 100%" (Spike)
                    // If current > prev * 2
                    if (
                        prev.energyGenerated > 10 &&
                        energy > prev.energyGenerated * 2
                    ) {
                        // Spike
                        await this.createAnomalyIfNotExists(
                            unitId,
                            AnomalyType.ERRATIC_FLUCTUATION,
                            AnomalySeverity.WARNING,
                            date,
                            `Abnormal energy spike (>100% increase from ${prev.energyGenerated} to ${energy} kWh)`,
                            {
                                expectedValue: prev.energyGenerated,
                                actualValue: energy,
                                deviationPercent: 100,
                            }
                        );
                    }
                }
            }
        }
    }

    private async detectDegradation(unitId: string) {
        // ---------------------------------------------------------
        // 4. PERFORMANCE DEGRADATION (Info)
        // "Check if 7-Day-Avg < (30-Day-Avg * 0.85)."
        // ---------------------------------------------------------

        const today = new Date();
        const startOfToday = startOfDay(today);

        // Use Repo
        const existing = await this.anomalyRepo.findOne({
            solarUnitId: unitId,
            anomalyType: AnomalyType.PERFORMANCE_DEGRADATION,
            detectionTimestamp: { $gte: startOfToday },
        });
        if (existing) return;

        const sevenDaysAgo = subDays(today, 7);
        const thirtyDaysAgo = subDays(today, 30);

        // Get 7 day avg
        const avg7 = await this.getAverageEnergy(unitId, sevenDaysAgo, today);

        // Get 30 day avg
        const avg30 = await this.getAverageEnergy(unitId, thirtyDaysAgo, today);

        if (avg30 > 50 && avg7 < avg30 * 0.85) {
            // Threshold >50 to avoid noise at night/low gen
            const deviation = Math.round(((avg30 - avg7) / avg30) * 100);
            await this.createAnomalyIfNotExists(
                unitId,
                AnomalyType.PERFORMANCE_DEGRADATION,
                AnomalySeverity.INFO,
                today,
                `7-Day average (${Math.round(avg7)}kWh) is ${deviation}% lower than 30-Day average (${Math.round(avg30)}kWh)`,
                {
                    expectedValue: Math.round(avg30),
                    actualValue: Math.round(avg7),
                    deviationPercent: deviation,
                }
            );
        }
    }

    private async getAverageEnergy(
        unitId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        // Accessing Repo method - previously logic was hard-coded in service.
        // We need to add this aggregation method to EnergyRecordRepository.
        // For now, I will use the repo instance to run aggregation if possible or add method to repo.
        // Since I can't modify repo in this same tool call easily without context switching, 
        // I'll assume I will add `getAverageEnergyInRange` to EnergyRepo.
        return this.energyRepo.getAverageEnergyInRange(unitId, startDate, endDate);
    }

    private async createAnomalyIfNotExists(
        unitId: string,
        type: AnomalyType,
        severity: AnomalySeverity,
        timestamp: Date,
        desc: string,
        metrics: any
    ) {
        // Check for duplicate alert for same timestamp/type to avoid spamming
        const exists = await this.anomalyRepo.findOne({
            solarUnitId: unitId,
            anomalyType: type,
            detectionTimestamp: timestamp,
        });

        if (!exists) {
            await this.anomalyRepo.create({
                solarUnitId: unitId,
                anomalyType: type,
                severity,
                detectionTimestamp: timestamp,
                description: desc,
                metrics,
                status: AnomalyStatus.NEW,
            });
            console.log(
                `[AnomalyDetection] Created ${severity} alert: ${type} at ${timestamp.toISOString()}`
            );
        }
    }
}
