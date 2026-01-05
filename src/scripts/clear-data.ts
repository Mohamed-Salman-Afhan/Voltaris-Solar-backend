import mongoose from "mongoose";
import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import { Anomaly } from "../infrastructure/entities/Anomaly";
import { CapacityFactorRecord } from "../infrastructure/entities/CapacityFactorRecord";
import { WeatherData } from "../infrastructure/entities/WeatherData";
import { connectDB } from "../infrastructure/db";
import dotenv from "dotenv";

dotenv.config();

async function clear() {
    try {
        await connectDB();
        console.log("Clearing all backend operational data...");

        await Anomaly.deleteMany({});
        await CapacityFactorRecord.deleteMany({});
        await WeatherData.deleteMany({});
        await SolarUnit.deleteMany({});

        console.log("Backend database cleared successfully (Users preserved).");
    } catch (error) {
        console.error("Error clearing backend database:", error);
    } finally {
        await mongoose.disconnect();
    }
}

clear();
