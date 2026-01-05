import mongoose from "mongoose";
import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import { Invoice } from "../infrastructure/entities/Invoice";
import { generateMonthlyInvoices } from "../application/background/generate-invoices";
import dotenv from "dotenv";
import { connectDB } from "../infrastructure/db";
import { subMonths, startOfMonth, endOfMonth, addHours } from "date-fns";

dotenv.config();

const generateData = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        const unit = await SolarUnit.findOne({ serialNumber: "SU-0001" });
        if (!unit) {
            console.error("Solar Unit SU-0001 not found");
            return;
        }

        console.log(`Found unit: ${unit.serialNumber} (${unit._id})`);

        // Target period: Last Month
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const start = startOfMonth(lastMonth);
        const end = endOfMonth(lastMonth);

        console.log(`Generating data for period: ${start.toISOString()} - ${end.toISOString()}`);

        // Clear existing records for this period to avoid duplicates if re-run
        await EnergyGenerationRecord.deleteMany({
            solarUnitId: unit._id,
            timestamp: { $gte: start, $lte: end }
        });

        // Clear existing invoice to allow regeneration
        await Invoice.deleteMany({
            solarUnitId: unit._id,
            billingPeriodStart: start,
            billingPeriodEnd: end
        });

        console.log("Cleared existing data for period.");

        const records = [];
        let current = new Date(start);

        while (current <= end) {
            // Generate some random energy
            // Night time (hours 20-5) -> 0 energy
            // Day time (hours 6-19) -> variable energy
            const hour = current.getHours();
            let energy = 0;

            if (hour >= 6 && hour <= 19) {
                // Peak around noon
                const distFromNoon = Math.abs(12 - hour);
                const maxEnergy = 50; // max 50 kWh per 4 hours
                energy = Math.max(0, maxEnergy - (distFromNoon * 5));
                energy += Math.random() * 5; // Add some noise
            }

            records.push({
                solarUnitId: unit._id,
                timestamp: new Date(current),
                energyGenerated: energy,
                intervalHours: 4
            });

            current = addHours(current, 4);
        }

        await EnergyGenerationRecord.insertMany(records);
        console.log(`Generated ${records.length} energy records.`);

        // Now trigger invoice generation
        console.log("Triggering invoice generation...");
        await generateMonthlyInvoices();

        console.log("Done.");

    } catch (error) {
        console.error("Error generating data:", error);
    } finally {
        await mongoose.disconnect();
    }
};

generateData();
