import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { SolarUnit } from "../../infrastructure/entities/SolarUnit";
import { EnergyGenerationRecord } from "../../infrastructure/entities/EnergyGenerationRecord";
import { Invoice } from "../../infrastructure/entities/Invoice";
import mongoose from "mongoose";

// Update signature to accept optional targetUnitId and return count
export const generateMonthlyInvoices = async (targetUnitId?: string): Promise<number> => {
    console.log(`Starting invoice generation (Retrospective & Monthly)${targetUnitId ? ` for ${targetUnitId}` : ''}...`);

    // 1. Get active solar units (All or Specific)
    const query = { status: "ACTIVE" } as any;
    if (targetUnitId) { // Fixed: Ensure targetUnitId is used if provided
        query._id = new mongoose.Types.ObjectId(targetUnitId);
    }
    const activeUnits = await SolarUnit.find(query);
    let createdCount = 0;

    // Define "Today" and the "Target End Date" (End of the last fully completed month)
    // Example: If today is Jan 7th, 2026 -> Target is Dec 31st, 2025.
    const now = new Date();
    const lastMonthRaw = subMonths(now, 1);
    const globalTargetEnd = endOfMonth(lastMonthRaw);

    for (const unit of activeUnits) {
        try {
            if (!unit.userId) {
                console.log(`Unit ${unit.serialNumber} has no user assigned, skipping.`);
                continue;
            }

            // Determine Start Date: Unit Installation Date or fallback to 1 month ago
            let iteratorDate = unit.installationDate ? new Date(unit.installationDate) : startOfMonth(lastMonthRaw);

            // Loop month-by-month until we reach the global target end date
            while (iteratorDate <= globalTargetEnd) {
                // Determine the billing window for THIS month in the loop
                // Start of window: First of the month OR Installation date (if it happened this month)
                const currentMonthStart = startOfMonth(iteratorDate);
                const periodStart = iteratorDate > currentMonthStart ? iteratorDate : currentMonthStart;

                // End of window: End of the month
                const periodEnd = endOfMonth(iteratorDate);

                // Safety: Don't bill for future months (should be covered by while loop, but double check)
                if (periodStart > globalTargetEnd) break;

                // 2. Check if invoice already exists for this exact period (fuzzy match on month/year)
                // We use a range check to see if an invoice overlaps significantly or covers this month
                const existingInvoice = await Invoice.findOne({
                    solarUnitId: unit._id,
                    billingPeriodStart: { $gte: startOfMonth(periodStart), $lte: endOfMonth(periodEnd) }
                } as any);

                if (existingInvoice) {
                    // Invoice exists for this month, move to next month
                    iteratorDate = addMonths(startOfMonth(iteratorDate), 1);
                    continue;
                }

                // 3. Calculate total energy generated for this window
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

                if (totalEnergy > 0) {
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
                    console.log(`[Invoice] Created for ${unit.serialNumber}: ${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)} (${totalEnergy.toFixed(2)} kWh)`);
                }

                // Move iterator to the 1st of the NEXT month
                // Use a safe increment logic
                iteratorDate = addMonths(startOfMonth(iteratorDate), 1);
            }

        } catch (error) {
            console.error(`Error processing unit ${unit.serialNumber}:`, error);
        }
    }

    console.log(`Invoice generation complete. Created ${createdCount} new invoices.`);
    return createdCount;
};
