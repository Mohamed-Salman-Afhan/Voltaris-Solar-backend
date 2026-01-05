import { z } from "zod";
import { CreateSolarUnitDto, UpdateSolarUnitDto } from "../domain/dtos/solar-unit";
import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import { NextFunction, Request, Response } from "express";
import { NotFoundError, ValidationError } from "../domain/errors/errors";
import { User } from "../infrastructure/entities/User";
import { getAuth } from "@clerk/express";
import { AnomalyService } from "../domain/services/anomaly.service";

export const getAllSolarUnits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const solarUnits = await SolarUnit.find();
    res.status(200).json(solarUnits);
  } catch (error) {
    next(error);
  }
};

export const createSolarUnitValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = CreateSolarUnitDto.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  next();
};

export const createSolarUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: z.infer<typeof CreateSolarUnitDto> = req.body;

    const newSolarUnit = {
      serialNumber: data.serialNumber,
      installationDate: new Date(data.installationDate),
      capacity: data.capacity,
      status: data.status,
      location: data.location,
      city: data.city,
      country: data.country,
    };

    const createdSolarUnit = await SolarUnit.create(newSolarUnit);

    // Trigger asynchronous data seeding (fire and forget)
    // 1. Data API History
    triggerSeedHistory(createdSolarUnit.toObject()).catch(err => {
      console.error(`Failed to trigger history seed for ${createdSolarUnit.serialNumber}:`, err.message);
    });

    // 2. Local Backend Anomalies
    AnomalyService.seedAnomaliesForUnit(createdSolarUnit.serialNumber).catch(err => {
      console.error(`Failed to seed anomalies for ${createdSolarUnit.serialNumber}:`, err.message);
    });

    res.status(201).json(createdSolarUnit);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Solar unit with this Serial Number already exists" });
    }
    next(error);
  }
};

// Helper: Call Data API to seed history
async function triggerSeedHistory(solarUnit: any) {
  const DATA_API_URL = process.env.DATA_API_URL || "http://localhost:8001";
  try {
    console.log(`Triggering history seed for ${solarUnit.serialNumber}...`);
    // Note: Node 18+ has global fetch
    const response = await fetch(`${DATA_API_URL}/api/energy-generation-records/seed-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(solarUnit)
    });

    if (!response.ok) {
      console.error(`Seed API failed: ${response.status} ${response.statusText}`);
    } else {
      console.log(`Seed API success for ${solarUnit.serialNumber}`);
    }
  } catch (err) {
    console.error("Error calling Seed API:", err);
  }
}

export const getSolarUnitById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const solarUnit = await SolarUnit.findById(id);

    if (!solarUnit) {
      throw new NotFoundError("Solar unit not found");
    }
    res.status(200).json(solarUnit);
  } catch (error) {
    next(error);
  }
};

export const getSolarUnitForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const solarUnits = await SolarUnit.find({ userId: user._id });
    res.status(200).json(solarUnits);
  } catch (error) {
    next(error);
  }
};

export const updateSolarUnitValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = UpdateSolarUnitDto.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  next();
};

export const updateSolarUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { serialNumber, installationDate, capacity, status, userId, location, city, country } = req.body;
  const solarUnit = await SolarUnit.findById(id);

  if (!solarUnit) {
    throw new NotFoundError("Solar unit not found");
  }

  const updatedSolarUnit = await SolarUnit.findByIdAndUpdate(id, {
    serialNumber,
    installationDate,
    capacity,
    status,
    userId,
    location,
    city,
    country,
  });

  res.status(200).json(updatedSolarUnit);
};

export const deleteSolarUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const solarUnit = await SolarUnit.findById(id);

    if (!solarUnit) {
      throw new NotFoundError("Solar unit not found");
    }

    await SolarUnit.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};