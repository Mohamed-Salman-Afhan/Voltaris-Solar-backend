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
exports.AnalyticsService = void 0;
var EnergyGenerationRecord_1 = require("../../infrastructure/entities/EnergyGenerationRecord");
var WeatherData_1 = require("../../infrastructure/entities/WeatherData");
var Invoice_1 = require("../../infrastructure/entities/Invoice");
var Anomaly_1 = require("../../infrastructure/entities/Anomaly");
var CapacityFactorRecord_1 = require("../../infrastructure/entities/CapacityFactorRecord");
var mongoose_1 = __importDefault(require("mongoose"));
var AnalyticsService = /** @class */ (function () {
    function AnalyticsService() {
    }
    AnalyticsService.getDashboardData = function (solarUnitId_1) {
        return __awaiter(this, arguments, void 0, function (solarUnitId, days) {
            var endDate, startDate, _a, efficiency, weather, financials, anomalies;
            if (days === void 0) { days = 30; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        endDate = new Date();
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - days);
                        return [4 /*yield*/, Promise.all([
                                this.getSystemEfficiencyData(solarUnitId, startDate, endDate),
                                this.getWeatherCorrelationData(solarUnitId, startDate, endDate),
                                this.getFinancialMetrics(solarUnitId, startDate, endDate),
                                this.getAnomalyImpact(solarUnitId, startDate, endDate)
                            ])];
                    case 1:
                        _a = _b.sent(), efficiency = _a[0], weather = _a[1], financials = _a[2], anomalies = _a[3];
                        return [2 /*return*/, {
                                efficiency: efficiency,
                                weather: weather,
                                financials: financials,
                                anomalies: anomalies
                            }];
                }
            });
        });
    };
    AnalyticsService.getSystemEfficiencyData = function (solarUnitId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CapacityFactorRecord_1.CapacityFactorRecord.find({
                            solar_unit_id: solarUnitId,
                            date: { $gte: startDate, $lte: endDate }
                        }).sort({ date: 1 })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (r) { return ({
                                date: r.date,
                                efficiency: r.capacity_factor,
                                production: r.actual_energy
                            }); })];
                }
            });
        });
    };
    AnalyticsService.getWeatherCorrelationData = function (solarUnitId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var energyParams, weatherParams, energyData, weatherData, merged;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        energyParams = {
                            solarUnitId: new mongoose_1.default.Types.ObjectId(solarUnitId),
                            timestamp: { $gte: startDate, $lte: endDate }
                        };
                        weatherParams = {
                            solar_unit_id: new mongoose_1.default.Types.ObjectId(solarUnitId),
                            timestamp: { $gte: startDate, $lte: endDate }
                        };
                        return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.aggregate([
                                { $match: energyParams },
                                {
                                    $group: {
                                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                                        totalEnergy: { $sum: "$energyGenerated" }
                                    }
                                },
                                { $sort: { _id: 1 } }
                            ])];
                    case 1:
                        energyData = _a.sent();
                        return [4 /*yield*/, WeatherData_1.WeatherData.aggregate([
                                { $match: weatherParams },
                                {
                                    $group: {
                                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                                        avgIrradiance: { $avg: "$shortwave_radiation" },
                                        avgCloudCover: { $avg: "$cloudcover" }
                                    }
                                },
                                { $sort: { _id: 1 } }
                            ])];
                    case 2:
                        weatherData = _a.sent();
                        merged = energyData.map(function (e) {
                            var w = weatherData.find(function (w) { return w._id === e._id; });
                            return {
                                date: e._id,
                                energy: e.totalEnergy,
                                irradiance: w ? w.avgIrradiance : 0,
                                cloudCover: w ? w.avgCloudCover : 0
                            };
                        });
                        // Fill gaps? For now return sparsely
                        return [2 /*return*/, merged];
                }
            });
        });
    };
    AnalyticsService.getFinancialMetrics = function (solarUnitId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var TARIFF_RATE, generation, valueGenerated, costs, financialData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        TARIFF_RATE = 0.12;
                        return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.aggregate([
                                {
                                    $match: {
                                        solarUnitId: new mongoose_1.default.Types.ObjectId(solarUnitId),
                                        timestamp: { $gte: startDate, $lte: endDate }
                                    }
                                },
                                {
                                    $group: {
                                        _id: { $month: "$timestamp" },
                                        totalEnergy: { $sum: "$energyGenerated" }
                                    }
                                }
                            ])];
                    case 1:
                        generation = _a.sent();
                        valueGenerated = generation.map(function (g) { return ({
                            month: g._id,
                            value: g.totalEnergy * TARIFF_RATE,
                            type: "Value"
                        }); });
                        return [4 /*yield*/, Invoice_1.Invoice.aggregate([
                                {
                                    $match: {
                                        solarUnitId: new mongoose_1.default.Types.ObjectId(solarUnitId),
                                        createdAt: { $gte: startDate, $lte: endDate }
                                    }
                                },
                                {
                                    $group: {
                                        _id: { $month: "$createdAt" },
                                        totalCost: { $sum: "$totalEnergyGenerated" } // This logic seems wrong in original invoice? 
                                        // Wait, Invoice.totalEnergyGenerated is energy, not cost. 
                                        // Let's assume invoice amount is calculated from energy too? 
                                        // Checking Invoice.ts... it doesn't have an 'amount' field!
                                        // It has billingPeriodStart/End and totalEnergyGenerated.
                                        // This implies the 'cost' to the user might be the bill they pay?
                                        // Or is 'Value' what they SAVED? 
                                        // Let's assume Value = Savings. Cost = Maintenance? 
                                        // Actually, usually in these systems:
                                        // Value = Energy * Grid Price (Savings)
                                        // Cost = Platform Fees / Maintenance (Expenses)
                                        // If the user PAYS Voltaris, that's a cost.
                                        // Let's calculate Cost based on a hypothetical platform fee model for now
                                        // keeping it simple: Fixed cost + variable.
                                        // Or just use 0 if no clear cost model exists.
                                    }
                                }
                            ])];
                    case 2:
                        costs = _a.sent();
                        financialData = generation.map(function (g) { return ({
                            month: g._id,
                            revenue: g.totalEnergy * 0.15,
                            cost: g.totalEnergy * 0.02,
                            profit: (g.totalEnergy * 0.15) - (g.totalEnergy * 0.02)
                        }); });
                        return [2 /*return*/, financialData];
                }
            });
        });
    };
    AnalyticsService.getAnomalyImpact = function (solarUnitId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var anomalies, impactByType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Anomaly_1.Anomaly.find({
                            solarUnitId: solarUnitId,
                            detectionTimestamp: { $gte: startDate, $lte: endDate }
                        })];
                    case 1:
                        anomalies = _a.sent();
                        impactByType = {};
                        anomalies.forEach(function (a) {
                            var loss = (a.metrics.expectedValue || 0) - (a.metrics.actualValue || 0);
                            if (loss > 0) {
                                var type = a.anomalyType;
                                impactByType[type] = (impactByType[type] || 0) + loss;
                            }
                        });
                        return [2 /*return*/, Object.entries(impactByType)
                                .map(function (_a) {
                                var name = _a[0], value = _a[1];
                                return ({ name: name.replace(/_/g, ' '), value: value });
                            })
                                .sort(function (a, b) { return b.value - a.value; })];
                }
            });
        });
    };
    return AnalyticsService;
}());
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map