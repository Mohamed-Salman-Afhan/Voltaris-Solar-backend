import mongoose from "mongoose";

const capacityFactorRecordSchema = new mongoose.Schema({
    solar_unit_id: {
        type: mongoose.Schema.Types.ObjectId,
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

export const CapacityFactorRecord = mongoose.model(
    "CapacityFactorRecord",
    capacityFactorRecordSchema
);
