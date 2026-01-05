import { z } from "zod";

export const CreateSolarUnitDto = z.object({
  serialNumber: z.string().min(1),
  installationDate: z.string().min(1),
  capacity: z.number(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const UpdateSolarUnitDto = z.object({
  serialNumber: z.string().min(1),
  installationDate: z.string().min(1),
  capacity: z.number(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]),
  userId: z.string().min(1),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const GetAllEnergyGenerationRecordsQueryDto = z.object({
  groupBy: z.enum(["date", "hour", "weekly"]).optional(),
  limit: z.string().min(1),
});