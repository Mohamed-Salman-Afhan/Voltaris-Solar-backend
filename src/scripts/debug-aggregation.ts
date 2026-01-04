import { connectDB } from "../infrastructure/db";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGODB_URI && process.env.MONGODB_URL) {
            process.env.MONGODB_URI = process.env.MONGODB_URL;
        }
        await connectDB();

        // Get a unit ID
        const record = await EnergyGenerationRecord.findOne();
        if (!record) {
            console.log("No records found!");
            return;
        }
        const unitId = record.solarUnitId;
        console.log(`Testing with Unit ID: ${unitId}`);

        // Test Weekly Aggregation
        const pipeline: any[] = [
            { $match: { solarUnitId: unitId } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%G-W%V", date: "$timestamp" } }
                    },
                    totalEnergy: { $sum: "$energyGenerated" },
                }
            },
            { $sort: { "_id.date": -1 } }
        ];

        const results = await EnergyGenerationRecord.aggregate(pipeline);
        console.log("Aggregation Results:", JSON.stringify(results, null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
