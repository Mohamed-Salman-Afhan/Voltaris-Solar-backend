import express from "express";
import { getCapacityFactorStats } from "../application/capacity-factor";
import { NotFoundError } from "../domain/errors/custom-errors";

const capacityFactorRouter = express.Router();

capacityFactorRouter.get("/:unit_id", async (req, res) => {
    try {
        const { unit_id } = req.params;
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const result = await getCapacityFactorStats(unit_id, days);
        res.json({ success: true, ...result });
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ success: false, error: error.message });
        } else {
            console.error(error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
});

export default capacityFactorRouter;
