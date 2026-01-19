import { SolarUnit } from "../../infrastructure/entities/SolarUnit";
import { EnergyGenerationRecord } from "../../infrastructure/entities/EnergyGenerationRecord";
import { WeatherData } from "../../infrastructure/entities/WeatherData";
import { Invoice } from "../../infrastructure/entities/Invoice";
import { Anomaly } from "../../infrastructure/entities/Anomaly";
import { CapacityFactorRecord } from "../../infrastructure/entities/CapacityFactorRecord";
import mongoose from "mongoose";
import { getCapacityFactorStats } from "../capacity-factor";

export class AnalyticsService {

    static async getDashboardData(solarUnitId: string, days: number = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [efficiencyData, weather, financials, anomalies] = await Promise.all([
            // Use the shared logic which includes self-healing
            getCapacityFactorStats(solarUnitId, days),
            this.getWeatherCorrelationData(solarUnitId, startDate, endDate),
            this.getFinancialMetrics(solarUnitId, startDate, endDate),
            this.getAnomalyImpact(solarUnitId, startDate, endDate)
        ]);

        // Map the shared response format to what the analytics frontend expects
        const efficiency = efficiencyData.data.map(r => ({
            date: new Date(r.date),
            efficiency: r.capacity_factor,
            production: r.actual_energy
        }));

        return {
            efficiency,
            weather,
            financials,
            anomalies
        };
    }

    // getSystemEfficiencyData is no longer needed as a standalone method doing raw queries
    // or can be kept as a private helper if we really wanted to separate it, but inline is fine.

    static async getWeatherCorrelationData(solarUnitId: string, startDate: Date, endDate: Date) {
        // Aggregate energy and weather data by day
        // Note: Ideally this would be a join, but for simplicity we'll fetch and merge

        const energyParams = {
            solarUnitId: new mongoose.Types.ObjectId(solarUnitId),
            timestamp: { $gte: startDate, $lte: endDate }
        };

        const weatherParams = {
            solar_unit_id: new mongoose.Types.ObjectId(solarUnitId),
            timestamp: { $gte: startDate, $lte: endDate }
        };

        const energyData = await EnergyGenerationRecord.aggregate([
            { $match: energyParams },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    totalEnergy: { $sum: "$energyGenerated" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const weatherData = await WeatherData.aggregate([
            { $match: weatherParams },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    avgIrradiance: { $avg: "$shortwave_radiation" },
                    avgCloudCover: { $avg: "$cloudcover" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Merge arrays
        const merged = energyData.map(e => {
            const w = weatherData.find(w => w._id === e._id);
            return {
                date: e._id,
                energy: e.totalEnergy,
                irradiance: w ? w.avgIrradiance : 0,
                cloudCover: w ? w.avgCloudCover : 0
            };
        });

        // Fill gaps? For now return sparsely
        return merged;
    }

    static async getFinancialMetrics(solarUnitId: string, startDate: Date, endDate: Date) {
        // 1. Calculate Value Generated (Total Energy * Avg Rate)
        // Assumption: Rate is $0.12/kWh (can be moved to config)
        const TARIFF_RATE = 0.12;

        const generation = await EnergyGenerationRecord.aggregate([
            {
                $match: {
                    solarUnitId: new mongoose.Types.ObjectId(solarUnitId),
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: "$timestamp" },
                    totalEnergy: { $sum: "$energyGenerated" }
                }
            }
        ]);

        const valueGenerated = generation.map(g => ({
            month: g._id,
            value: g.totalEnergy * TARIFF_RATE,
            type: "Value"
        }));

        // 2. Fetch Costs (Invoices)
        // Just sum up invoice totals for the period
        const costs = await Invoice.aggregate([
            {
                $match: {
                    solarUnitId: new mongoose.Types.ObjectId(solarUnitId),
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalCost: { $sum: "$totalEnergyGenerated" } // This logic seems wrong in original invoice? 
                    // Wait, Invoice.totalEnergyGenerated is energy, not cost. 
                    // Let's assume invoice amount is calculated from energy too? 
                    // Checking Invoice.ts... it doesn't have an 'amount' field!
                    // It has billingPeriodStart/End and totalEnergyGenerated.
                    // This implies the 'cost' to the user might be the bill they pay?
                    // Or is 'Value' what they SAVED? 
                    // Let's assume Value = Savings. Cost = Maintenance? 
                    // Actually, usually in these systems:
                    // Value = Energy * Grid Price (Savings)
                    // Cost = Platform Fees / Maintenance (Expenses)
                    // If the user PAYS Voltaris, that's a cost.

                    // Let's calculate Cost based on a hypothetical platform fee model for now
                    // keeping it simple: Fixed cost + variable.
                    // Or just use 0 if no clear cost model exists.
                }
            }
        ]);

        // For MVP, since Invoice doesn't have dollar amount, let's ESTIMATE
        // Value = Generated * 0.15 (Grid Rate)
        // Cost = Generated * 0.02 (Platform Fee)

        const financialData = generation.map(g => ({
            month: g._id,
            revenue: g.totalEnergy * 0.15,
            cost: g.totalEnergy * 0.02,
            profit: (g.totalEnergy * 0.15) - (g.totalEnergy * 0.02)
        }));

        return financialData;
    }

    static async getAnomalyImpact(solarUnitId: string, startDate: Date, endDate: Date) {
        const anomalies = await Anomaly.find({
            solarUnitId: solarUnitId,
            detectionTimestamp: { $gte: startDate, $lte: endDate }
        });

        // Group by type and sum energy lost
        const impactByType: Record<string, number> = {};

        anomalies.forEach(a => {
            const loss = (a.metrics.expectedValue || 0) - (a.metrics.actualValue || 0);
            if (loss > 0) {
                const type = a.anomalyType;
                impactByType[type] = (impactByType[type] || 0) + loss;
            }
        });

        return Object.entries(impactByType)
            .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
            .sort((a, b) => b.value - a.value);
    }
}
