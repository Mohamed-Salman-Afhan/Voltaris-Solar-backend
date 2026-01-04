import { connectDB } from "../infrastructure/db";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import { Anomaly } from "../infrastructure/entities/Anomaly";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        if (!process.env.MONGODB_URI && process.env.MONGODB_URL) {
            process.env.MONGODB_URI = process.env.MONGODB_URL;
        }
        await connectDB();
        console.log("Clearing Energy Records and Anomalies to force re-sync...");
        await EnergyGenerationRecord.deleteMany({});
        await Anomaly.deleteMany({});
        console.log("Cleared all records.");
    } catch (e) {
        console.error("Error clearing DB:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
