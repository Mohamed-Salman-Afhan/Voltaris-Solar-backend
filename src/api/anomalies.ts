import express from 'express';
import { Anomaly } from '../infrastructure/entities/Anomaly';
import { NotFoundError } from './errors/not-found-error';
import { z } from 'zod';

const router = express.Router();

// GET /api/anomalies/unit/:unitId
// Get anomalies for a specific unit
router.get('/unit/:unitId', async (req, res, next) => {
    try {
        const { unitId } = req.params;
        const { status, severity } = req.query;

        const query: any = { solarUnitId: unitId };
        if (status) query.status = status;
        if (severity) query.severity = severity;

        const anomalies = await Anomaly.find(query).sort({ detectionTimestamp: -1 });

        res.json({
            success: true,
            data: anomalies
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/anomalies/admin
// Get all anomalies (Admin view)
router.get('/admin', async (req, res, next) => {
    try {
        const { status, type, severity } = req.query;

        const query: any = {};
        if (status) query.status = status;
        if (type) query.anomalyType = type;
        if (severity) query.severity = severity;

        const anomalies = await Anomaly.find(query)
            .populate('solarUnitId', 'serialNumber')
            .sort({ detectionTimestamp: -1 });

        res.json({
            success: true,
            data: anomalies
        });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/anomalies/:anomalyId
// Update status (Acknowledge/Resolve)
const UpdateAnomalySchema = z.object({
    status: z.enum(['NEW', 'ACKNOWLEDGED', 'RESOLVED']),
    resolutionNotes: z.string().optional()
});

router.patch('/:anomalyId', async (req, res, next) => {
    try {
        const { anomalyId } = req.params;
        const body = UpdateAnomalySchema.parse(req.body);

        const anomaly = await Anomaly.findByIdAndUpdate(
            anomalyId,
            {
                status: body.status,
                resolutionNotes: body.resolutionNotes
            },
            { new: true }
        );

        if (!anomaly) {
            throw new NotFoundError("Anomaly alert not found");
        }

        res.json({
            success: true,
            data: anomaly
        });
    } catch (error) {
        next(error);
    }
});

export { router as anomalyRouter };
