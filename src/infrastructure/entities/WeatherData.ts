import mongoose from "mongoose";

const weatherDataSchema = new mongoose.Schema({
    solar_unit_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SolarUnit",
        required: true,
    },
    location: {
        latitude: Number,
        longitude: Number,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    temperature: Number,
    cloudcover: Number,
    windspeed: Number, // m/s
    shortwave_radiation: Number, // W/m²
    impact_level: {
        type: String,
        enum: ["Optimal", "Degraded", "Poor"],
    },
    cached_at: {
        type: Date,
        default: Date.now,
    },
});

export const WeatherData = mongoose.model("WeatherData", weatherDataSchema);
