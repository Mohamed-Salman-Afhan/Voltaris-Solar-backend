import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { SolarUnit } from "../../infrastructure/entities/SolarUnit";
import { EnergyGenerationRecord } from "../../infrastructure/entities/EnergyGenerationRecord";
import { Invoice } from "../../infrastructure/entities/Invoice";
import mongoose from "mongoose";

export const generateMonthlyInvoices = async () => {
    console.log("Starting monthly invoice generation...");

    // 1. Get all active solar units
    const activeUnits = await SolarUnit.find({ status: "ACTIVE" });

    // 2. Determine billing period (last month)
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const periodStart = startOfMonth(lastMonth);
    const periodEnd = endOfMonth(lastMonth);

    console.log(`Generating invoices for period: ${periodStart.toISOString()} - ${periodEnd.toISOString()}`);

    let createdCount = 0;

    for (const unit of activeUnits) {
        try {
            if (!unit.userId) {
                console.log(`Unit ${unit.serialNumber} has no user assigned, skipping invoice.`);
                continue;
            }

            // Check if invoice already exists for this period and unit
            const existingInvoice = await Invoice.findOne({
                solarUnitId: unit._id,
                billingPeriodStart: periodStart,
                billingPeriodEnd: periodEnd,
            });

            if (existingInvoice) {
                console.log(`Invoice already exists for unit ${unit.serialNumber} for this period.`);
                continue;
            }

            // 3. Calculate total energy generated
            const records = await EnergyGenerationRecord.aggregate([
                {
                    $match: {
                        solarUnitId: unit._id,
                        timestamp: { $gte: periodStart, $lte: periodEnd },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalEnergy: { $sum: "$energyGenerated" },
                    },
                },
            ]);

            const totalEnergy = records.length > 0 ? records[0].totalEnergy : 0;

            if (totalEnergy <= 0) {
                console.log(`No energy generated for unit ${unit.serialNumber}, skipping invoice.`);
                continue;
            }

            // 4. Create Invoice
            await Invoice.create({
                solarUnitId: unit._id as mongoose.Types.ObjectId,
                userId: unit.userId,
                billingPeriodStart: periodStart,
                billingPeriodEnd: periodEnd,
                totalEnergyGenerated: totalEnergy,
                paymentStatus: "PENDING",
            });

            createdCount++;
            console.log(`Created invoice for unit ${unit.serialNumber}: ${totalEnergy.toFixed(2)} kWh`);

        } catch (error) {
            console.error(`Error generating invoice for unit ${unit.serialNumber}:`, error);
        }
    }

    console.log(`Invoice generation complete. Created ${createdCount} invoices.`);
};
