import mongoose, { Schema, Document } from 'mongoose';
import { AnomalyType, AnomalySeverity, AnomalyStatus } from '../../domain/constants';

export interface IAnomaly extends Document {
    solarUnitId: mongoose.Types.ObjectId;
    anomalyType: AnomalyType;
    severity: AnomalySeverity;
    detectionTimestamp: Date;      // When the issue occurred
    description: string;           // e.g., "Zero output detected at peak hour"
    metrics: {
        expectedValue: number;       // e.g., 300 kWh
        actualValue: number;         // e.g., 0 kWh
        deviationPercent?: number;   // e.g., 100%
    };
    status: AnomalyStatus;
    resolutionNotes?: string;
}

const AnomalySchema: Schema = new Schema({
    solarUnitId: { type: Schema.Types.ObjectId, ref: 'SolarUnit', required: true },
    anomalyType: {
        type: String,
        enum: Object.values(AnomalyType),
        required: true
    },
    severity: {
        type: String,
        enum: Object.values(AnomalySeverity),
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
        enum: Object.values(AnomalyStatus),
        default: AnomalyStatus.NEW
    },
    resolutionNotes: { type: String }
}, {
    timestamps: true
});

// Optimize: "Check if we already evaluated this today" query in detectDegradation
AnomalySchema.index({ solarUnitId: 1, anomalyType: 1, detectionTimestamp: -1 });

export const Anomaly = mongoose.model<IAnomaly>('Anomaly', AnomalySchema);
