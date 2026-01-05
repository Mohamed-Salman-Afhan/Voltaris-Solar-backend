import { connectDB } from "../infrastructure/db";
import { User } from "../infrastructure/entities/User";
import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    await connectDB();

    const user = await User.findOne({});
    if (!user) {
        console.log("No user found. Please sign up in the app first.");
        process.exit(1);
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);

    if (!user.imageUrl) {
        // Sample image to demonstrate UI
        user.imageUrl = "https://api.dicebear.com/9.x/avataaars/svg?seed=Emma";
        await user.save();
        console.log("Updated user with sample image URL.");
    }

    const units = [
        { serial: "SU-0002", status: "ACTIVE" },
        { serial: "SU-0003", status: "MAINTENANCE" },
    ];

    for (const u of units) {
        const existing = await SolarUnit.findOne({ serialNumber: u.serial });
        if (existing) {
            // Update ownership to this user just in case
            existing.userId = user._id;
            await existing.save();
            console.log(`Unit ${u.serial} already exists. Assigned to user.`);
        } else {
            await SolarUnit.create({
                serialNumber: u.serial,
                userId: user._id,
                status: u.status,
                capacity: 5000,
                installationDate: new Date(),
                location: { latitude: 0, longitude: 0 }
            });
            console.log(`Created unit ${u.serial} for user.`);
        }
    }

    console.log("Setup complete.");
    await mongoose.disconnect();
}

run();
