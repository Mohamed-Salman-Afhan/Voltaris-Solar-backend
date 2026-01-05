import { Anomaly } from "../../infrastructure/entities/Anomaly";
import { SolarUnit } from "../../infrastructure/entities/SolarUnit";
import mongoose from "mongoose";

export class AnomalyService {
    /**
     * Generates sample anomalies for a given solar unit to populate the dashboard.
     */
    static async seedAnomaliesForUnit(serialNumber: string) {
        console.log(`Seeding anomalies for unit: ${serialNumber}`);

        const unit = await SolarUnit.findOne({ serialNumber });
        if (!unit) {
            throw new Error(`Solar Unit ${serialNumber} not found locally in backend.`);
        }

        // Define some sample anomalies relative to "now"
        const now = new Date();
        const anomalies = [
            {
                solarUnitId: unit._id,
                anomalyType: 'PERFORMANCE_DEGRADATION',
                severity: 'WARNING',
                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
                description: 'Persistent low output detected (85% of expected) over 48h.',
                metrics: {
                    expectedValue: 4500,
                    actualValue: 3800,
                    deviationPercent: 15
                },
                status: 'RESOLVED',
                resolutionNotes: 'Cleaned panels.'
            },
            {
                solarUnitId: unit._id,
                anomalyType: 'ERRATIC_FLUCTUATION',
                severity: 'INFO',
                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 hours ago
                description: 'Minor voltage fluctuations detected during cloud cover.',
                metrics: {
                    expectedValue: 300,
                    actualValue: 280,
                    deviationPercent: 6
                },
                status: 'ACKNOWLEDGED'
            },
            {
                solarUnitId: unit._id,
                anomalyType: 'ZERO_GENERATION',
                severity: 'CRITICAL',
                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
                description: 'Inverter reported 0W output during peak sun hours.',
                metrics: {
                    expectedValue: 4200,
                    actualValue: 0,
                    deviationPercent: 100
                },
                status: 'NEW'
            },
            {
                solarUnitId: unit._id,
                anomalyType: 'INVERTER_OFFLINE',
                severity: 'CRITICAL',
                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
                description: 'Inverter unresponsive to keep-alive pings.',
                metrics: {
                    expectedValue: 1,
                    actualValue: 0,
                    deviationPercent: 100
                },
                status: 'RESOLVED',
                resolutionNotes: 'Firmware reset.'
            },
            {
                solarUnitId: unit._id,
                anomalyType: 'PANEL_SHADING',
                severity: 'WARNING',
                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 mins ago
                description: 'Partial shading pattern detected on String 2.',
                metrics: {
                    expectedValue: 3500,
                    actualValue: 2800,
                    deviationPercent: 20
                },
                status: 'NEW'
            },
            {
                solarUnitId: unit._id,
                anomalyType: 'GRID_INSTABILITY',
                severity: 'INFO',
                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3), // 3 hours ago
                description: 'Grid frequency deviation detected (>0.5Hz).',
                metrics: {
                    expectedValue: 60,
                    actualValue: 60.8,
                    deviationPercent: 1.3
                },
                status: 'ACKNOWLEDGED'
            },
            {
                solarUnitId: unit._id,
                anomalyType: 'TEMPERATURE_OVERHEAT',
                severity: 'WARNING',
                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
                description: 'Panel temperature exceeding operational norm (75°C).',
                metrics: {
                    expectedValue: 45,
                    actualValue: 78,
                    deviationPercent: 73
                },
                status: 'NEW'
            }
        ];

        // Delete existing anomalies for this unit to avoid duplicates during repeated seeding
        await Anomaly.deleteMany({ solarUnitId: unit._id });

        // Insert new sample anomalies
        await Anomaly.insertMany(anomalies);

        console.log(`Successfully seeded ${anomalies.length} anomalies for ${serialNumber}`);
    }
}
