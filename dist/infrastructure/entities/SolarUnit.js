"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolarUnit = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var constants_1 = require("../../domain/constants");
var solarUnitSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true,
    },
    installationDate: {
        type: Date,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(constants_1.SolarUnitStatus),
    },
    location: {
        latitude: Number,
        longitude: Number,
    },
    city: { type: String },
    country: { type: String },
}, { timestamps: true });
exports.SolarUnit = mongoose_1.default.model("SolarUnit", solarUnitSchema);
//# sourceMappingURL=SolarUnit.js.map