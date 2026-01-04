import { GetAllEnergyGenerationRecordsQueryDto } from "../domain/dtos/solar-unit";
import { ValidationError } from "../domain/errors/errors";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const getAllEnergyGenerationRecordsBySolarUnitId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const results = GetAllEnergyGenerationRecordsQueryDto.safeParse(req.query);
    if (!results.success) {
      throw new ValidationError(results.error.message);
    }

    const { groupBy, limit } = results.data;
    const limitNum = limit ? parseInt(limit) : 7; // default limit if not provided

    if (!groupBy) {
      const energyGenerationRecords = await EnergyGenerationRecord.find({
        solarUnitId: id,
      }).sort({ timestamp: -1 });
      return res.status(200).json(energyGenerationRecords);
    }

    if (groupBy === "date") {
      const pipeline: any[] = [
        { $match: { solarUnitId: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
            },
            totalEnergy: { $sum: "$energyGenerated" },
          },
        },
        { $sort: { "_id.date": -1 } },
      ];

      if (limit) {
        pipeline.push({ $limit: limitNum });
      }

      const energyGenerationRecords = await EnergyGenerationRecord.aggregate(pipeline);
      return res.status(200).json(energyGenerationRecords);
    }

    if (groupBy === "hour") {
      const pipeline: any[] = [
        { $match: { solarUnitId: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" },
              },
            },
            totalEnergy: { $sum: "$energyGenerated" },
          }
        },
        { $sort: { "_id.date": -1 } }
      ];

      if (limit) {
        pipeline.push({ $limit: limitNum });
      }

      const energyGenerationRecords = await EnergyGenerationRecord.aggregate(pipeline);
      return res.status(200).json(energyGenerationRecords);
    }

    if (groupBy === "weekly") {
      const pipeline: any[] = [
        { $match: { solarUnitId: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: {
              // Returns Year-Week e.g. "2025-05"
              date: { $dateToString: { format: "%G-W%V", date: "$timestamp" } }
            },
            totalEnergy: { $sum: "$energyGenerated" },
          }
        },
        { $sort: { "_id.date": -1 } }
      ];

      if (limit) {
        pipeline.push({ $limit: limitNum });
      }

      const energyGenerationRecords = await EnergyGenerationRecord.aggregate(pipeline);
      return res.status(200).json(energyGenerationRecords);
    }

  } catch (error) {
    next(error);
  }
};