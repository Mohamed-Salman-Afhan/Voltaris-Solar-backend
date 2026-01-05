"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var invoiceSchema = new mongoose_1.default.Schema({
    solarUnitId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "SolarUnit",
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
    },
    paidAt: {
        type: Date,
    },
}, { timestamps: true });
exports.Invoice = mongoose_1.default.model("Invoice", invoiceSchema);
//# sourceMappingURL=Invoice.js.map