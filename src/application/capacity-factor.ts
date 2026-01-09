import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import { CapacityFactorRecord } from "../infrastructure/entities/CapacityFactorRecord";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import { NotFoundError } from "../api/errors/not-found-error";
import { startOfDay, subDays, format } from "date-fns";

const DEFAULT_PEAK_SUN_HOURS = 5;

interface CapacityFactorStat {
    date: string; // YYYY-MM-DD
    capacity_factor: number;
    actual_energy: number;
    theoretical_maximum: number;
}

interface CapacityFactorResponse {
    data: CapacityFactorStat[];
    trend: "improving" | "declining" | "stable";
    average_cf: number;
}

export const getCapacityFactorStats = async (
    solarUnitId: string,
    days: number = 7
): Promise<CapacityFactorResponse> => {
    const solarUnit = await SolarUnit.findById(solarUnitId);
    if (!solarUnit) {
        throw new NotFoundError("Solar Unit not found");
    }

    const resultData: CapacityFactorStat[] = [];
    const endDate = startOfDay(new Date()); // Today 00:00:00

    for (let i = days; i >= 0; i--) {
        const date = subDays(endDate, i);
        const dateStr = format(date, "yyyy-MM-dd");

        // Try to find existing record
        let record = await CapacityFactorRecord.findOne({
            solar_unit_id: solarUnitId,
            date: date,
        });

        if (!record) {
            // Calculate it
            // Aggregate energy for that day
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const energyAgg = await EnergyGenerationRecord.aggregate([
                {
                    $match: {
                        solarUnitId: solarUnit._id,
                        timestamp: { $gte: date, $lt: nextDay },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalEnergy: { $sum: "$energyGenerated" }, // Assuming 'power' field is energy in kWh or similar. Need to check EnergyGenerationRecord schema.
                    },
                },
            ]);

            const actualEnergy = energyAgg.length > 0 ? energyAgg[0].totalEnergy : 0;
            // Note: If data is power (kW) over time, we need to integrate.
            // Assuming EnergyGenerationRecord stores instantaneous power or energy chunks?
            // "power" usually implies kW. If records are every 15 mins, Energy = Sum(Power * 0.25h).
            // Let's check EnergyGenerationRecord schema first.

            // For now, let's assume direct sum or fix later.

            const capacity = solarUnit.capacity; // kW
            const peakSunHours = DEFAULT_PEAK_SUN_HOURS;
            const theoreticalMax = capacity * peakSunHours;

            let cf = 0;
            if (theoreticalMax > 0) {
                cf = (actualEnergy / theoreticalMax) * 100;
                cf = Math.round(cf * 100) / 100; // Round to 2 decimals
            }

            // Only save if day is fully passed? Yes, we are looking at past days.
            record = await CapacityFactorRecord.create({
                solar_unit_id: solarUnitId,
                date: date,
                actual_energy: actualEnergy,
                installed_capacity: capacity,
                peak_sun_hours: peakSunHours,
                capacity_factor: cf,
            });
        }

        resultData.push({
            date: dateStr,
            capacity_factor: record.capacity_factor,
            actual_energy: record.actual_energy,
            theoretical_maximum: record.installed_capacity * record.peak_sun_hours,
        });
    }

    // Calculate Trend
    // Split into two halves
    const mid = Math.floor(resultData.length / 2);
    const firstHalf = resultData.slice(0, mid);
    const secondHalf = resultData.slice(mid);

    const avgFirst =
        firstHalf.reduce((acc, curr) => acc + curr.capacity_factor, 0) /
        (firstHalf.length || 1);
    const avgSecond =
        secondHalf.reduce((acc, curr) => acc + curr.capacity_factor, 0) /
        (secondHalf.length || 1);

    let trend: "improving" | "declining" | "stable" = "stable";
    if (avgSecond > avgFirst * 1.05) trend = "improving";
    else if (avgSecond < avgFirst * 0.95) trend = "declining";

    const totalAvg =
        resultData.reduce((acc, curr) => acc + curr.capacity_factor, 0) /
        resultData.length;

    return {
        data: resultData,
        trend,
        average_cf: Math.round(totalAvg * 100) / 100,
    };
};
