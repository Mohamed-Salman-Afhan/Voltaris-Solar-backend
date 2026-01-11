import mongoose from "mongoose";
import { PaymentStatus } from "../../domain/constants";

export interface IInvoice extends mongoose.Document {
    solarUnitId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
    totalEnergyGenerated: number;
    paymentStatus: PaymentStatus;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const invoiceSchema = new mongoose.Schema({
    solarUnitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SolarUnit",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    billingPeriodStart: {
        type: Date,
        required: true,
    },
    billingPeriodEnd: {
        type: Date,
        required: true,
    },
    totalEnergyGenerated: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING,
    },
    paidAt: {
        type: Date,
    },
}, { timestamps: true });

export const Invoice = mongoose.model<IInvoice>("Invoice", invoiceSchema);
