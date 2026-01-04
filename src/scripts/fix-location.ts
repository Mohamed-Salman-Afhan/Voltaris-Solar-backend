
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { SolarUnit } from "../infrastructure/entities/SolarUnit";

// Explicitly load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const updateLocation = async () => {
    try {
        const uri = process.env.MONGODB_URL;
        if (!uri) {
            throw new Error("MONGODB_URL not found in environment variables");
        }
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const unitId = "695a14c81eb689e61e5a711c";

        // Check if unit exists
        const unit = await SolarUnit.findById(unitId);
        if (!unit) {
            console.log(`Unit ${unitId} not found. Searching for ANY unit...`);
            const anyUnit = await SolarUnit.findOne();
            if (anyUnit) {
                console.log(`Found unit ${anyUnit._id}. Updating...`);
                anyUnit.location = {
                    latitude: 40.7128,
                    longitude: -74.0060
                };
                await anyUnit.save();
                console.log("Location updated successfully.");
            } else {
                console.log("No solar units found in database.");
            }
        } else {
            unit.location = {
                latitude: 40.7128,
                longitude: -74.0060
            };
            await unit.save();
            console.log(`Updated location for unit ${unitId}`);
        }

        process.exit(0);

    } catch (error) {
        console.error("Error updating location:", error);
        process.exit(1);
    }
};

updateLocation();
