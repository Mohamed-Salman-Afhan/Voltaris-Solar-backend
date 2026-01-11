import { NextFunction, Request, Response } from "express";
import { EnergyService } from "../../application/services/energy.service";
import { GetAllEnergyGenerationRecordsQueryDto } from "../../domain/dtos/solar-unit";
import { ValidationError } from "../../domain/errors/errors";

const energyService = new EnergyService();

export const getEnergyStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        // Validate Query Params
        const results = GetAllEnergyGenerationRecordsQueryDto.safeParse(req.query);
        if (!results.success) {
            throw new ValidationError(results.error.message);
        }

        const data = await energyService.getEnergyStats(id, results.data);

        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};
