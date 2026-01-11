
import { NextFunction, Request, Response } from "express";
import { SolarUnitService } from "../../application/services/solar-unit.service";
import { CreateSolarUnitDto, UpdateSolarUnitDto } from "../../domain/dtos/solar-unit";
import { ValidationError } from "../../domain/errors/errors";
import { getAuth } from "@clerk/express";

const solarService = new SolarUnitService();

export const getAllSolarUnits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await solarService.getAll(req.query);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const createSolarUnitValidator = (req: Request, res: Response, next: NextFunction) => {
    const result = CreateSolarUnitDto.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.message);
    }
    next();
};

export const createSolarUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await solarService.create(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Solar unit with this Serial Number already exists" });
        }
        next(error);
    }
};

export const getSolarUnitById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await solarService.getById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getSolarUnitForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = getAuth(req);
        const clerkUserId = auth.userId;
        if (!clerkUserId) throw new ValidationError("Unauthorized");

        const result = await solarService.getForUser(clerkUserId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateSolarUnitValidator = (req: Request, res: Response, next: NextFunction) => {
    const result = UpdateSolarUnitDto.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.message);
    }
    next();
};

export const updateSolarUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await solarService.update(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteSolarUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await solarService.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
