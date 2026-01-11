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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMonthlyInvoices = void 0;
var date_fns_1 = require("date-fns");
var SolarUnit_1 = require("../../infrastructure/entities/SolarUnit");
var EnergyGenerationRecord_1 = require("../../infrastructure/entities/EnergyGenerationRecord");
var Invoice_1 = require("../../infrastructure/entities/Invoice");
var mongoose_1 = __importDefault(require("mongoose"));
// Update signature to accept optional targetUnitId and return count
var generateMonthlyInvoices = function (targetUnitId) { return __awaiter(void 0, void 0, void 0, function () {
    var query, activeUnits, createdCount, now, lastMonthRaw, globalTargetEnd, _i, activeUnits_1, unit, iteratorDate, currentMonthStart, periodStart, periodEnd, existingInvoice, records, totalEnergy, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Starting invoice generation (Retrospective & Monthly)".concat(targetUnitId ? " for ".concat(targetUnitId) : '', "..."));
                query = { status: "ACTIVE" };
                if (targetUnitId) { // Fixed: Ensure targetUnitId is used if provided
                    query._id = new mongoose_1.default.Types.ObjectId(targetUnitId);
                }
                return [4 /*yield*/, SolarUnit_1.SolarUnit.find(query)];
            case 1:
                activeUnits = _a.sent();
                createdCount = 0;
                now = new Date();
                lastMonthRaw = (0, date_fns_1.subMonths)(now, 1);
                globalTargetEnd = (0, date_fns_1.endOfMonth)(lastMonthRaw);
                _i = 0, activeUnits_1 = activeUnits;
                _a.label = 2;
            case 2:
                if (!(_i < activeUnits_1.length)) return [3 /*break*/, 12];
                unit = activeUnits_1[_i];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 10, , 11]);
                if (!unit.userId) {
                    console.log("Unit ".concat(unit.serialNumber, " has no user assigned, skipping."));
                    return [3 /*break*/, 11];
                }
                iteratorDate = unit.installationDate ? new Date(unit.installationDate) : (0, date_fns_1.startOfMonth)(lastMonthRaw);
                _a.label = 4;
            case 4:
                if (!(iteratorDate <= globalTargetEnd)) return [3 /*break*/, 9];
                currentMonthStart = (0, date_fns_1.startOfMonth)(iteratorDate);
                periodStart = iteratorDate > currentMonthStart ? iteratorDate : currentMonthStart;
                periodEnd = (0, date_fns_1.endOfMonth)(iteratorDate);
                // Safety: Don't bill for future months (should be covered by while loop, but double check)
                if (periodStart > globalTargetEnd)
                    return [3 /*break*/, 9];
                return [4 /*yield*/, Invoice_1.Invoice.findOne({
                        solarUnitId: unit._id,
                        billingPeriodStart: { $gte: (0, date_fns_1.startOfMonth)(periodStart), $lte: (0, date_fns_1.endOfMonth)(periodEnd) }
                    })];
            case 5:
                existingInvoice = _a.sent();
                if (existingInvoice) {
                    // Invoice exists for this month, move to next month
                    iteratorDate = (0, date_fns_1.addMonths)((0, date_fns_1.startOfMonth)(iteratorDate), 1);
                    return [3 /*break*/, 4];
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
            case 6:
                records = _a.sent();
                totalEnergy = records.length > 0 ? records[0].totalEnergy : 0;
                if (!(totalEnergy > 0)) return [3 /*break*/, 8];
                // 4. Create Invoice
                return [4 /*yield*/, Invoice_1.Invoice.create({
                        solarUnitId: unit._id,
                        userId: unit.userId,
                        billingPeriodStart: periodStart,
                        billingPeriodEnd: periodEnd,
                        totalEnergyGenerated: totalEnergy,
                        paymentStatus: "PENDING",
                    })];
            case 7:
                // 4. Create Invoice
                _a.sent();
                createdCount++;
                console.log("[Invoice] Created for ".concat(unit.serialNumber, ": ").concat(periodStart.toISOString().slice(0, 10), " to ").concat(periodEnd.toISOString().slice(0, 10), " (").concat(totalEnergy.toFixed(2), " kWh)"));
                _a.label = 8;
            case 8:
                // Move iterator to the 1st of the NEXT month
                // Use a safe increment logic
                iteratorDate = (0, date_fns_1.addMonths)((0, date_fns_1.startOfMonth)(iteratorDate), 1);
                return [3 /*break*/, 4];
            case 9: return [3 /*break*/, 11];
            case 10:
                error_1 = _a.sent();
                console.error("Error processing unit ".concat(unit.serialNumber, ":"), error_1);
                return [3 /*break*/, 11];
            case 11:
                _i++;
                return [3 /*break*/, 2];
            case 12:
                console.log("Invoice generation complete. Created ".concat(createdCount, " new invoices."));
                return [2 /*return*/, createdCount];
        }
    });
}); };
exports.generateMonthlyInvoices = generateMonthlyInvoices;
//# sourceMappingURL=generate-invoices.js.map