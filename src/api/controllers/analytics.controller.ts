import { Request, Response } from "express";
import { AnalyticsService } from "../../application/services/analytics.service";

export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        const { solarUnitId } = req.params;
        const days = parseInt(req.query.days as string) || 30;

        const data = await AnalyticsService.getDashboardData(solarUnitId, days);

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching analytics dashboard data:", error);
        res.status(500).json({ message: "Failed to fetch analytics data" });
    }
};
