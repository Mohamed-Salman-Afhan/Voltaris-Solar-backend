"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllEnergyGenerationRecordsQueryDto = exports.UpdateSolarUnitDto = exports.CreateSolarUnitDto = void 0;
var zod_1 = require("zod");
exports.CreateSolarUnitDto = zod_1.z.object({
    serialNumber: zod_1.z.string().min(1),
    installationDate: zod_1.z.string().min(1),
    capacity: zod_1.z.number(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]),
    location: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }).optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
});
exports.UpdateSolarUnitDto = zod_1.z.object({
    serialNumber: zod_1.z.string().min(1),
    installationDate: zod_1.z.string().min(1),
    capacity: zod_1.z.number(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]),
    userId: zod_1.z.string().min(1),
    location: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }).optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
});
exports.GetAllEnergyGenerationRecordsQueryDto = zod_1.z.object({
    groupBy: zod_1.z.enum(["date", "hour", "weekly"]).optional(),
    limit: zod_1.z.string().min(1),
});
//# sourceMappingURL=solar-unit.js.map