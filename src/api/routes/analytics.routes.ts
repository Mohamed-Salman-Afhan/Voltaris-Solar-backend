import express from "express";
import { getDashboardMetrics } from "../controllers/analytics.controller";

const router = express.Router();

router.get("/:solarUnitId", getDashboardMetrics);

export default router;
