"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminInvoices = void 0;
var Invoice_1 = require("../../infrastructure/entities/Invoice");
var RATE_PER_KWH = 0.05;
var getAdminInvoices = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status, userId, days, page, limit, skip, matchStage, date, statsAggregation, stats, countResult, invoices, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.query, status = _a.status, userId = _a.userId, days = _a.days;
                page = parseInt(req.query.page) || 1;
                limit = parseInt(req.query.limit) || 15;
                skip = (page - 1) * limit;
                matchStage = {};
                if (status)
                    matchStage.paymentStatus = status;
                if (userId)
                    matchStage.userId = userId;
                // Date filter (e.g., last 30 days)
                if (days) {
                    date = new Date();
                    date.setDate(date.getDate() - parseInt(days));
                    matchStage.createdAt = { $gte: date };
                }
                return [4 /*yield*/, Invoice_1.Invoice.aggregate([
                        { $match: matchStage },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: {
                                    $sum: {
                                        $cond: [{ $eq: ["$paymentStatus", "PAID"] }, { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] }, 0]
                                    }
                                },
                                totalPending: {
                                    $sum: {
                                        $cond: [{ $eq: ["$paymentStatus", "PENDING"] }, { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] }, 0]
                                    }
                                },
                                totalFailed: {
                                    $sum: {
                                        $cond: [{ $eq: ["$paymentStatus", "FAILED"] }, { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] }, 0]
                                    }
                                }
                            }
                        }
                    ])];
            case 1:
                statsAggregation = _b.sent();
                stats = statsAggregation.length > 0 ? statsAggregation[0] : { totalRevenue: 0, totalPending: 0, totalFailed: 0 };
                return [4 /*yield*/, Invoice_1.Invoice.countDocuments(matchStage)];
            case 2:
                countResult = _b.sent();
                return [4 /*yield*/, Invoice_1.Invoice.aggregate([
                        { $match: matchStage },
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: "solarunits",
                                localField: "solarUnitId",
                                foreignField: "_id",
                                as: "solarUnit"
                            }
                        },
                        { $unwind: { path: "$solarUnit", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                paymentStatus: 1,
                                totalEnergyGenerated: 1,
                                billingPeriodStart: 1,
                                billingPeriodEnd: 1,
                                createdAt: 1,
                                amount: { $multiply: ["$totalEnergyGenerated", RATE_PER_KWH] },
                                "user.firstName": 1,
                                "user.lastName": 1,
                                "user.email": 1,
                                "solarUnit.serialNumber": 1,
                                "solarUnit.city": 1,
                                paidAt: 1
                            }
                        }
                    ])];
            case 3:
                invoices = _b.sent();
                res.status(200).json({ stats: stats, invoices: invoices, total: countResult, page: page, limit: limit, totalPages: Math.ceil(countResult / limit) });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error("Error fetching admin invoices:", error_1);
                res.status(500).json({ message: "Failed to fetch invoices" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getAdminInvoices = getAdminInvoices;
//# sourceMappingURL=admin-invoice.controller.js.map