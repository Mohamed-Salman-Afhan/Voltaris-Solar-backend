import { connectDB } from "../infrastructure/db";
import { syncEnergyGenerationRecords } from "../application/background/sync-energy-generation-records";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        // Handle MONGODB_URL vs MONGODB_URI
        if (!process.env.MONGODB_URI && process.env.MONGODB_URL) {
            process.env.MONGODB_URI = process.env.MONGODB_URL;
        }

        await connectDB();
        console.log("Running Manual Sync Job...");
        await syncEnergyGenerationRecords();
        console.log("Sync Job Completed.");
    } catch (e) {
        console.error("Error running sync:", e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
