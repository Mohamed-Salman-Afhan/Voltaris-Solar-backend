"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapacityFactorRecord = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var capacityFactorRecordSchema = new mongoose_1.default.Schema({
    solar_unit_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "SolarUnit",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    actual_energy: {
        type: Number,
        required: true,
    }, // kWh
    installed_capacity: {
        type: Number,
        required: true,
    }, // kW
    peak_sun_hours: {
        type: Number,
        required: true,
    },
    capacity_factor: {
        type: Number,
        required: true,
    }, // %
    calculated_at: {
        type: Date,
        default: Date.now,
    },
});
// Ensure unique record per unit per day
capacityFactorRecordSchema.index({ solar_unit_id: 1, date: 1 }, { unique: true });
exports.CapacityFactorRecord = mongoose_1.default.model("CapacityFactorRecord", capacityFactorRecordSchema);
//# sourceMappingURL=CapacityFactorRecord.js.map