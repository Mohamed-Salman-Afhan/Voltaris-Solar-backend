import mongoose, { Schema, Document } from 'mongoose';

export interface IAnomaly extends Document {
    solarUnitId: mongoose.Types.ObjectId;
    anomalyType: 'ZERO_GENERATION' | 'SUDDEN_DROP' | 'ERRATIC_FLUCTUATION' | 'PERFORMANCE_DEGRADATION';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    detectionTimestamp: Date;      // When the issue occurred
    description: string;           // e.g., "Zero output detected at peak hour"
    metrics: {
        expectedValue: number;       // e.g., 300 kWh
        actualValue: number;         // e.g., 0 kWh
        deviationPercent?: number;   // e.g., 100%
    };
    status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
    resolutionNotes?: string;
}

const AnomalySchema: Schema = new Schema({
    solarUnitId: { type: Schema.Types.ObjectId, ref: 'SolarUnit', required: true },
    anomalyType: {
        type: String,
        enum: ['ZERO_GENERATION', 'SUDDEN_DROP', 'ERRATIC_FLUCTUATION', 'PERFORMANCE_DEGRADATION'],
        required: true
    },
    severity: {
        type: String,
        enum: ['CRITICAL', 'WARNING', 'INFO'],
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
        enum: ['NEW', 'ACKNOWLEDGED', 'RESOLVED'],
        default: 'NEW'
    },
    resolutionNotes: { type: String }
}, {
    timestamps: true
});

export const Anomaly = mongoose.model<IAnomaly>('Anomaly', AnomalySchema);
