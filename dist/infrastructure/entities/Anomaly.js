"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anomaly = void 0;
var mongoose_1 = __importStar(require("mongoose"));
var constants_1 = require("../../domain/constants");
var AnomalySchema = new mongoose_1.Schema({
    solarUnitId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SolarUnit', required: true },
    anomalyType: {
        type: String,
        enum: Object.values(constants_1.AnomalyType),
        required: true
    },
    severity: {
        type: String,
        enum: Object.values(constants_1.AnomalySeverity),
        required: true
    },
    detectionTimestamp: { type: Date, required: true },
    description: { type: String, required: true },
    metrics: {
        expectedValue: { type: Number, required: true },
        actualValue: { type: Number, required: true },
        deviationPercent: { type: Number }
    },
    status: {
        type: String,
        enum: Object.values(constants_1.AnomalyStatus),
        default: constants_1.AnomalyStatus.NEW
    },
    resolutionNotes: { type: String }
}, {
    timestamps: true
});
// Optimize: "Check if we already evaluated this today" query in detectDegradation
AnomalySchema.index({ solarUnitId: 1, anomalyType: 1, detectionTimestamp: -1 });
exports.Anomaly = mongoose_1.default.model('Anomaly', AnomalySchema);
//# sourceMappingURL=Anomaly.js.map