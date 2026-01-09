import mongoose from "mongoose";
import { connectDB } from "../infrastructure/db";
import { AnomalyDetectionService } from "../application/anomaly-detection";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import { SolarUnit } from "../infrastructure/entities/SolarUnit";
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

        const unit = await SolarUnit.findOne({ serialNumber });
        if (!unit) {
            console.error(`Solar Unit ${serialNumber} not found.`);
            return;
        }

        const historyRecords = await EnergyGenerationRecord.find({ solarUnitId: unit._id });

        if (historyRecords.length > 0) {
            console.log(`Analyzing ${historyRecords.length} historical records for anomalies...`);
            // This will detect "Instantaneous" anomalies like Zero Generation or Spikes
            // throughout the entire history.
            await AnomalyDetectionService.analyzeRecords(historyRecords);
            console.log("Anomaly analysis complete.");
        } else {
            console.log("No energy records found for this unit. Run seed-history first.");
        }

    } catch (error) {
        console.error("Error seeding anomalies:", error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
