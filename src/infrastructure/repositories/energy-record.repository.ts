import mongoose from "mongoose";
import { EnergyGenerationRecord } from "../entities/EnergyGenerationRecord";

export class EnergyRecordRepository {
    async findBySolarUnitId(solarUnitId: string, limit: number) {
        return EnergyGenerationRecord.find({ solarUnitId })
            .sort({ timestamp: -1 })
            .limit(limit); // Although original didn't explicitly limit the simple find, it's good practice. The original only limited aggregations or default limit.
        // Wait, original code: 
        // if (!groupBy) { 
        //   const energyGenerationRecords = await EnergyGenerationRecord.find({ solarUnitId: id }).sort({ timestamp: -1 }); 
        //   return res.status(200).json(energyGenerationRecords); 
        // }
        // It didn't limit! But it parsed limit? 
        // "const limitNum = limit ? parseInt(limit) : 7;"
        // The original code only used `limitNum` in the aggregations (groupBy logic).
        // The simple find query IGNORED the limit. This might have been a bug or intended.
        // I should probably support limit in the simple find too if I'm refactoring, or stick to exact parity.
        // Let's stick to exact parity for now but maybe add the capability.
    }

    async findBySolarUnitIdSimple(solarUnitId: string) {
        return EnergyGenerationRecord.find({ solarUnitId }).sort({ timestamp: -1 });
    }

    async getAggregatedStats(solarUnitId: string, groupBy: "date" | "hour" | "weekly", limit: number) {
        const pipeline: any[] = [
            { $match: { solarUnitId: new mongoose.Types.ObjectId(solarUnitId) } },
        ];

        let dateFormat = "%Y-%m-%d";
        if (groupBy === "hour") dateFormat = "%Y-%m-%d %H:00";
        if (groupBy === "weekly") dateFormat = "%G-W%V";

        pipeline.push({
            $group: {
                _id: {
                    date: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                },
                totalEnergy: { $sum: "$energyGenerated" },
            },
        });

        pipeline.push({ $sort: { "_id.date": -1 } });

        if (limit) {
            pipeline.push({ $limit: limit });
        }

        return EnergyGenerationRecord.aggregate(pipeline);
    }
}
