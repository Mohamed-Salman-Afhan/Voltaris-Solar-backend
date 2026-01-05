"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherData = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var weatherDataSchema = new mongoose_1.default.Schema({
    solar_unit_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.WeatherData = mongoose_1.default.model("WeatherData", weatherDataSchema);
//# sourceMappingURL=WeatherData.js.map