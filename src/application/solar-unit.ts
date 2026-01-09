import { z } from "zod";
import { CreateSolarUnitDto, UpdateSolarUnitDto } from "../domain/dtos/solar-unit";
import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import { NextFunction, Request, Response } from "express";
import { NotFoundError, ValidationError } from "../domain/errors/errors";
import { User } from "../infrastructure/entities/User";
import { getAuth } from "@clerk/express";

import { syncEnergyGenerationRecords } from "./background/sync-energy-generation-records";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import { AnomalyDetectionService } from "./anomaly-detection";
import { Invoice } from "../infrastructure/entities/Invoice";
import { generateMonthlyInvoices } from "./background/generate-invoices";

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

    // 4. Provision the Unit (Seed -> Sync -> Anomaly -> Billing)
    // We await this to ensure the "Instant" experience the user requested.
    // If this takes too long (>10s), we might need to move to async, but for <5000 records it should be fine.
    try {
      const { SolarUnitProvisioningService } = await import("./provisioning.service");
      await SolarUnitProvisioningService.provisionUnit(createdSolarUnit.toObject());
    } catch (err) {
      console.error(`[Create] Provisioning failed for ${createdSolarUnit.serialNumber}:`, err);
      // We still return 201 because the unit WAS created, but we log the error.
    }

    res.status(201).json(createdSolarUnit);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Solar unit with this Serial Number already exists" });
    }
    next(error);
  }
};


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
  try {
    const { id } = req.params;
    const { serialNumber, installationDate, capacity, status, userId, location, city, country } = req.body;

    const solarUnit = await SolarUnit.findById(id);

    if (!solarUnit) {
      throw new NotFoundError("Solar unit not found");
    }

    // Check if ownership is changing
    const oldOwnerId = solarUnit.userId?.toString();
    const newOwnerId = userId?.toString();
    const isOwnerChanging = newOwnerId && oldOwnerId !== newOwnerId;

    const updatedSolarUnit = await SolarUnit.findByIdAndUpdate(id, {
      serialNumber,
      installationDate,
      capacity,
      status,
      userId,
      location,
      city,
      country,
    }, { new: true });

    // Cascade Update: Transfer records and invoices if owner changed
    if (isOwnerChanging) {
      console.log(`[OwnershipTransfer] Transferring data for Unit ${id} from ${oldOwnerId} to ${newOwnerId}...`);

      const invoiceResult = await Invoice.updateMany(
        { solarUnitId: id },
        { $set: { userId: userId } }
      );
      console.log(`[OwnershipTransfer] Moved ${invoiceResult.modifiedCount} invoices.`);

      const energyResult = await EnergyGenerationRecord.updateMany(
        { solarUnitId: id },
        { $set: { userId: userId } }
      );
      console.log(`[OwnershipTransfer] Moved ${energyResult.modifiedCount} energy records.`);
    }

    // New Logic: If a user is assigned (and wasn't before, OR ownership changed), trigger billing check.
    // This catches the case where a unit was created as an "orphan" (no user) and then assigned later.
    if (userId && (oldOwnerId !== userId.toString())) {
      console.log(`[Update] User assigned to Unit ${id}. Triggering retrospective billing...`);
      // Run in background to not block response
      generateMonthlyInvoices(id).then(count => {
        if (count > 0) console.log(`[Update] Generated ${count} invoices for newly assigned unit.`);
      }).catch(err => console.error("[Update] Billing trigger failed:", err));
    }

    res.status(200).json(updatedSolarUnit);
  } catch (error) {
    next(error);
  }
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