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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCapacityFactorStats = void 0;
var SolarUnit_1 = require("../infrastructure/entities/SolarUnit");
var CapacityFactorRecord_1 = require("../infrastructure/entities/CapacityFactorRecord");
var EnergyGenerationRecord_1 = require("../infrastructure/entities/EnergyGenerationRecord");
var not_found_error_1 = require("../api/errors/not-found-error");
var date_fns_1 = require("date-fns");
var DEFAULT_PEAK_SUN_HOURS = 5;
var getCapacityFactorStats = function (solarUnitId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([solarUnitId_1], args_1, true), void 0, function (solarUnitId, days) {
        var solarUnit, resultData, endDate, i, date, dateStr, record, nextDay, energyAgg, actualEnergy, capacity, peakSunHours, theoreticalMax, cf, mid, firstHalf, secondHalf, avgFirst, avgSecond, trend, totalAvg;
        if (days === void 0) { days = 7; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, SolarUnit_1.SolarUnit.findById(solarUnitId)];
                case 1:
                    solarUnit = _a.sent();
                    if (!solarUnit) {
                        throw new not_found_error_1.NotFoundError("Solar Unit not found");
                    }
                    resultData = [];
                    endDate = (0, date_fns_1.startOfDay)(new Date());
                    i = days;
                    _a.label = 2;
                case 2:
                    if (!(i > 0)) return [3 /*break*/, 8];
                    date = (0, date_fns_1.subDays)(endDate, i);
                    dateStr = (0, date_fns_1.format)(date, "yyyy-MM-dd");
                    return [4 /*yield*/, CapacityFactorRecord_1.CapacityFactorRecord.findOne({
                            solar_unit_id: solarUnitId,
                            date: date,
                        })];
                case 3:
                    record = _a.sent();
                    if (!!record) return [3 /*break*/, 6];
                    nextDay = new Date(date);
                    nextDay.setDate(date.getDate() + 1);
                    return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.aggregate([
                            {
                                $match: {
                                    solarUnitId: solarUnit._id,
                                    timestamp: { $gte: date, $lt: nextDay },
                                },
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalEnergy: { $sum: "$energyGenerated" }, // Assuming 'power' field is energy in kWh or similar. Need to check EnergyGenerationRecord schema.
                                },
                            },
                        ])];
                case 4:
                    energyAgg = _a.sent();
                    actualEnergy = energyAgg.length > 0 ? energyAgg[0].totalEnergy : 0;
                    capacity = solarUnit.capacity;
                    peakSunHours = DEFAULT_PEAK_SUN_HOURS;
                    theoreticalMax = capacity * peakSunHours;
                    cf = 0;
                    if (theoreticalMax > 0) {
                        cf = (actualEnergy / theoreticalMax) * 100;
                        cf = Math.round(cf * 100) / 100; // Round to 2 decimals
                    }
                    return [4 /*yield*/, CapacityFactorRecord_1.CapacityFactorRecord.create({
                            solar_unit_id: solarUnitId,
                            date: date,
                            actual_energy: actualEnergy,
                            installed_capacity: capacity,
                            peak_sun_hours: peakSunHours,
                            capacity_factor: cf,
                        })];
                case 5:
                    // Only save if day is fully passed? Yes, we are looking at past days.
                    record = _a.sent();
                    _a.label = 6;
                case 6:
                    resultData.push({
                        date: dateStr,
                        capacity_factor: record.capacity_factor,
                        actual_energy: record.actual_energy,
                        theoretical_maximum: record.installed_capacity * record.peak_sun_hours,
                    });
                    _a.label = 7;
                case 7:
                    i--;
                    return [3 /*break*/, 2];
                case 8:
                    mid = Math.floor(resultData.length / 2);
                    firstHalf = resultData.slice(0, mid);
                    secondHalf = resultData.slice(mid);
                    avgFirst = firstHalf.reduce(function (acc, curr) { return acc + curr.capacity_factor; }, 0) /
                        (firstHalf.length || 1);
                    avgSecond = secondHalf.reduce(function (acc, curr) { return acc + curr.capacity_factor; }, 0) /
                        (secondHalf.length || 1);
                    trend = "stable";
                    if (avgSecond > avgFirst * 1.05)
                        trend = "improving";
                    else if (avgSecond < avgFirst * 0.95)
                        trend = "declining";
                    totalAvg = resultData.reduce(function (acc, curr) { return acc + curr.capacity_factor; }, 0) /
                        resultData.length;
                    return [2 /*return*/, {
                            data: resultData,
                            trend: trend,
                            average_cf: Math.round(totalAvg * 100) / 100,
                        }];
            }
        });
    });
};
exports.getCapacityFactorStats = getCapacityFactorStats;
//# sourceMappingURL=capacity-factor.js.map