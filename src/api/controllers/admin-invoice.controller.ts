import { Request, Response } from "express";
import { Invoice } from "../../infrastructure/entities/Invoice";
import { SolarUnit } from "../../infrastructure/entities/SolarUnit";
import { User } from "../../infrastructure/entities/User";

const RATE_PER_KWH = 0.05;

export const getAdminInvoices = async (req: Request, res: Response) => {
    try {
        const { status, userId, days } = req.query;

        let matchStage: any = {};
        if (status) matchStage.paymentStatus = status;
        if (userId) matchStage.userId = userId;

        // Date filter (e.g., last 30 days)
        if (days) {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(days as string));
            matchStage.createdAt = { $gte: date };
        }

        // 1. Calculate Stats (Revenue, Pending, Overdue)
        const statsAggregation = await Invoice.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "PAID"] }, { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] }, 0]
                        }
                    },
                    totalPending: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "PENDING"] }, { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] }, 0]
                        }
                    },
                    totalFailed: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "FAILED"] }, { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] }, 0]
                        }
                    }
                }
            }
        ]);

        const stats = statsAggregation.length > 0 ? statsAggregation[0] : { totalRevenue: 0, totalPending: 0, totalFailed: 0 };

        // 2. Fetch Invoices with Details
        // We calculate 'amount' dynamically here too
        const invoices = await Invoice.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $limit: 100 }, // Cap at 100 for now, add pagination later if needed
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "solarunits",
                    localField: "solarUnitId",
                    foreignField: "_id",
                    as: "solarUnit"
                }
            },
            { $unwind: "$solarUnit" },
            {
                $project: {
                    _id: 1,
                    paymentStatus: 1,
                    totalEnergyGenerated: 1,
                    billingPeriodStart: 1,
                    billingPeriodEnd: 1,
                    createdAt: 1,
                    amount: { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] },
                    "user.firstName": 1,
                    "user.lastName": 1,
                    "user.email": 1,
                    "solarUnit.serialNumber": 1,
                    "solarUnit.city": 1
                }
            }
        ]);

        res.status(200).json({ stats, invoices });

    } catch (error) {
        console.error("Error fetching admin invoices:", error);
        res.status(500).json({ message: "Failed to fetch invoices" });
    }
};
