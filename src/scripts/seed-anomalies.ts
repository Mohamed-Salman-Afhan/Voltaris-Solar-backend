import mongoose from "mongoose";
import { connectDB } from "../infrastructure/db";
import { AnomalyService } from "../domain/services/anomaly.service";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    try {
        await connectDB();

        // Parse CLI args
        const args = process.argv.slice(2);
        const serialArg = args.find(arg => arg.startsWith('--serial='));

        if (!serialArg) {
            console.error("Usage: npm run seed:anomalies -- --serial=SU-XXXX");
            process.exit(1);
        }

        const serialNumber = serialArg.split('=')[1];
        if (!serialNumber) {
            console.error("Invalid serial number");
            process.exit(1);
        }

        console.log(`Starting anomaly seeding for ${serialNumber}...`);
        await AnomalyService.seedAnomaliesForUnit(serialNumber);
        console.log("Done.");

    } catch (error) {
        console.error("Error seeding anomalies:", error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
