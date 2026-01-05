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
exports.generateMonthlyInvoices = void 0;
var date_fns_1 = require("date-fns");
var SolarUnit_1 = require("../../infrastructure/entities/SolarUnit");
var EnergyGenerationRecord_1 = require("../../infrastructure/entities/EnergyGenerationRecord");
var Invoice_1 = require("../../infrastructure/entities/Invoice");
var generateMonthlyInvoices = function () { return __awaiter(void 0, void 0, void 0, function () {
    var activeUnits, now, lastMonth, periodStart, periodEnd, createdCount, _i, activeUnits_1, unit, existingInvoice, records, totalEnergy, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Starting monthly invoice generation...");
                return [4 /*yield*/, SolarUnit_1.SolarUnit.find({ status: "ACTIVE" })];
            case 1:
                activeUnits = _a.sent();
                now = new Date();
                lastMonth = (0, date_fns_1.subMonths)(now, 1);
                periodStart = (0, date_fns_1.startOfMonth)(lastMonth);
                periodEnd = (0, date_fns_1.endOfMonth)(lastMonth);
                console.log("Generating invoices for period: ".concat(periodStart.toISOString(), " - ").concat(periodEnd.toISOString()));
                createdCount = 0;
                _i = 0, activeUnits_1 = activeUnits;
                _a.label = 2;
            case 2:
                if (!(_i < activeUnits_1.length)) return [3 /*break*/, 9];
                unit = activeUnits_1[_i];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 7, , 8]);
                if (!unit.userId) {
                    console.log("Unit ".concat(unit.serialNumber, " has no user assigned, skipping invoice."));
                    return [3 /*break*/, 8];
                }
                return [4 /*yield*/, Invoice_1.Invoice.findOne({
                        solarUnitId: unit._id,
                        billingPeriodStart: periodStart,
                        billingPeriodEnd: periodEnd,
                    })];
            case 4:
                existingInvoice = _a.sent();
                if (existingInvoice) {
                    console.log("Invoice already exists for unit ".concat(unit.serialNumber, " for this period."));
                    return [3 /*break*/, 8];
                }
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.aggregate([
                        {
                            $match: {
                                solarUnitId: unit._id,
                                timestamp: { $gte: periodStart, $lte: periodEnd },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalEnergy: { $sum: "$energyGenerated" },
                            },
                        },
                    ])];
            case 5:
                records = _a.sent();
                totalEnergy = records.length > 0 ? records[0].totalEnergy : 0;
                if (totalEnergy <= 0) {
                    console.log("No energy generated for unit ".concat(unit.serialNumber, ", skipping invoice."));
                    return [3 /*break*/, 8];
                }
                // 4. Create Invoice
                return [4 /*yield*/, Invoice_1.Invoice.create({
                        solarUnitId: unit._id,
                        userId: unit.userId,
                        billingPeriodStart: periodStart,
                        billingPeriodEnd: periodEnd,
                        totalEnergyGenerated: totalEnergy,
                        paymentStatus: "PENDING",
                    })];
            case 6:
                // 4. Create Invoice
                _a.sent();
                createdCount++;
                console.log("Created invoice for unit ".concat(unit.serialNumber, ": ").concat(totalEnergy.toFixed(2), " kWh"));
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.error("Error generating invoice for unit ".concat(unit.serialNumber, ":"), error_1);
                return [3 /*break*/, 8];
            case 8:
                _i++;
                return [3 /*break*/, 2];
            case 9:
                console.log("Invoice generation complete. Created ".concat(createdCount, " invoices."));
                return [2 /*return*/];
        }
    });
}); };
exports.generateMonthlyInvoices = generateMonthlyInvoices;
//# sourceMappingURL=generate-invoices.js.map