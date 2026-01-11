import { SolarUnit, ISolarUnit } from "../entities/SolarUnit";
import { CreateSolarUnitDto, UpdateSolarUnitDto } from "../../domain/dtos/solar-unit";
import { z } from "zod";

export class SolarUnitRepository {
    async create(data: z.infer<typeof CreateSolarUnitDto>): Promise<ISolarUnit> {
        return SolarUnit.create(data) as unknown as Promise<ISolarUnit>;
    }

    async findById(id: string): Promise<ISolarUnit | null> {
        return SolarUnit.findById(id);
    }

    async findByUserId(userId: string): Promise<ISolarUnit[]> {
        return SolarUnit.find({ userId });
    }

    async findBySerialNumber(serialNumber: string): Promise<ISolarUnit | null> {
        return SolarUnit.findOne({ serialNumber });
    }

    async findAll(query: any, skip: number, limit: number): Promise<ISolarUnit[]> {
        return SolarUnit.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async count(query: any): Promise<number> {
        return SolarUnit.countDocuments(query);
    }

    async update(id: string, data: z.infer<typeof UpdateSolarUnitDto>): Promise<ISolarUnit | null> {
        return SolarUnit.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<ISolarUnit | null> {
        return SolarUnit.findByIdAndDelete(id);
    }
}
