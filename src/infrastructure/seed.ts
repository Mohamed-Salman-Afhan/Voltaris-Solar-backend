import mongoose from "mongoose";
import { SolarUnit } from "./entities/SolarUnit";
import { Anomaly } from "./entities/Anomaly";
import { CapacityFactorRecord } from "./entities/CapacityFactorRecord";
import { WeatherData } from "./entities/WeatherData";
import { User } from "./entities/User";
import dotenv from "dotenv";
import { connectDB } from "./db";

dotenv.config();

async function seed() {
  try {
    // Connect to DB
    await connectDB();

    console.log("Clearing existing data...");
    // Clear operational data
    await Anomaly.deleteMany({});
    await CapacityFactorRecord.deleteMany({});
    await WeatherData.deleteMany({});

    // Clear core entities
    await SolarUnit.deleteMany({});
    // We intentionally DO NOT clear Users to preserve login state

    console.log("Data cleared. Starting seed...");

    // Find an existing user to assign the unit to
    // Find an existing user to assign the unit to
    const user = await User.findOne({});
    let userId: mongoose.Types.ObjectId | undefined = undefined; // Use undefined if no user exists

    if (user) {
      console.log(`Found user: ${user.firstName} ${user.lastName} (${user._id})`);
      userId = user._id as mongoose.Types.ObjectId;
    } else {
      console.log("No existing user found. Unit will be unassigned.");
    }

    // Create a new solar unit
    const solarUnit = await SolarUnit.create({
      serialNumber: "SU-0001",
      installationDate: new Date("2025-08-01"),
      capacity: 5000,
      status: "ACTIVE",
      userId: userId,
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      city: "New York",
      country: "United States"
    });

    console.log(
      `Database seeded successfully. Created solar unit: ${solarUnit.serialNumber}`
    );
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();