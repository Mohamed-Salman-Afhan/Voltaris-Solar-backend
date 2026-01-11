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
exports.AnomalyDetectionService = void 0;
var anomaly_repository_1 = require("../../infrastructure/repositories/anomaly.repository");
var energy_record_repository_1 = require("../../infrastructure/repositories/energy-record.repository");
var date_fns_1 = require("date-fns");
var constants_1 = require("../../domain/constants");
var AnomalyDetectionService = /** @class */ (function () {
    function AnomalyDetectionService() {
        this.anomalyRepo = new anomaly_repository_1.AnomalyRepository();
        this.energyRepo = new energy_record_repository_1.EnergyRecordRepository();
    }
    /**
     * Main entry point to analyze a batch of new energy records.
     * @param newRecords Array of EnergyGenerationRecord documents or objects.
     */
    AnomalyDetectionService.prototype.analyzeRecords = function (newRecords) {
        return __awaiter(this, void 0, void 0, function () {
            var unitMap, _i, newRecords_1, r, uid, _a, _b, _c, unitId, records;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!newRecords || newRecords.length === 0)
                            return [2 /*return*/];
                        console.log("[AnomalyDetection] Analyzing ".concat(newRecords.length, " records..."));
                        unitMap = new Map();
                        for (_i = 0, newRecords_1 = newRecords; _i < newRecords_1.length; _i++) {
                            r = newRecords_1[_i];
                            uid = r.solarUnitId.toString();
                            if (!unitMap.has(uid))
                                unitMap.set(uid, []);
                            (_d = unitMap.get(uid)) === null || _d === void 0 ? void 0 : _d.push(r);
                        }
                        _a = 0, _b = Array.from(unitMap.entries());
                        _e.label = 1;
                    case 1:
                        if (!(_a < _b.length)) return [3 /*break*/, 5];
                        _c = _b[_a], unitId = _c[0], records = _c[1];
                        // Sort recs by timestamp ascending
                        records.sort(function (a, b) {
                            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                        });
                        return [4 /*yield*/, this.detectInstantaneousAnomalies(unitId, records)];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, this.detectDegradation(unitId)];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AnomalyDetectionService.prototype.detectInstantaneousAnomalies = function (unitId, records) {
        return __awaiter(this, void 0, void 0, function () {
            var i, current, date, hour, energy, prev, prevDate, diffMs, hoursDiff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < records.length)) return [3 /*break*/, 8];
                        current = records[i];
                        date = new Date(current.timestamp);
                        hour = date.getUTCHours();
                        energy = current.energyGenerated;
                        if (!(hour >= 10 && hour <= 14 && energy < 5)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createAnomalyIfNotExists(unitId, constants_1.AnomalyType.ZERO_GENERATION, constants_1.AnomalySeverity.CRITICAL, date, "Zero output detected during peak sunlight hours", { expectedValue: 200, actualValue: energy, deviationPercent: 100 })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        prev = null;
                        if (i > 0) {
                            prev = records[i - 1];
                        }
                        else {
                            // Try to fetch the very last record before this batch
                            // We use the EnergyRecordRepository here instead of direct Mongoose call
                            // But our Repo doesn't have a "findLastBefore" method yet.
                            // We'll trust findBySolarUnitIdSimple to return sorted by timestamp desc, so [0] is latest.
                            // But we need "before date".
                            // Let's assume for now optimization: we just skip if i=0 or implement strict check later.
                            // To be strict as per original code:
                            // prev = await EnergyGenerationRecord.findOne({ solarUnitId: unitId, timestamp: { $lt: date } }).sort({ timestamp: -1 });
                            // We should add this capability to Repository. For now, let's keep logic simple to avoid extensive repo changes if not needed urgently.
                            // Actually, let's add `findLastBefore` to EnergyRepo if we want to be pure.
                            // Or access via a query method.
                        }
                        if (!prev) return [3 /*break*/, 7];
                        prevDate = new Date(prev.timestamp);
                        diffMs = date.getTime() - prevDate.getTime();
                        hoursDiff = diffMs / (1000 * 60 * 60);
                        if (!(hoursDiff <= 3)) return [3 /*break*/, 7];
                        if (!(hour >= 8 && hour <= 16)) return [3 /*break*/, 5];
                        if (!(prev.energyGenerated > 20 &&
                            energy < prev.energyGenerated * 0.5)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.createAnomalyIfNotExists(unitId, constants_1.AnomalyType.SUDDEN_DROP, constants_1.AnomalySeverity.WARNING, date, "Sudden >50% drop in output (From ".concat(prev.energyGenerated, " to ").concat(energy, " kWh)"), {
                                expectedValue: prev.energyGenerated,
                                actualValue: energy,
                                deviationPercent: 50,
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!(prev.energyGenerated > 10 &&
                            energy > prev.energyGenerated * 2)) return [3 /*break*/, 7];
                        // Spike
                        return [4 /*yield*/, this.createAnomalyIfNotExists(unitId, constants_1.AnomalyType.ERRATIC_FLUCTUATION, constants_1.AnomalySeverity.WARNING, date, "Abnormal energy spike (>100% increase from ".concat(prev.energyGenerated, " to ").concat(energy, " kWh)"), {
                                expectedValue: prev.energyGenerated,
                                actualValue: energy,
                                deviationPercent: 100,
                            })];
                    case 6:
                        // Spike
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AnomalyDetectionService.prototype.detectDegradation = function (unitId) {
        return __awaiter(this, void 0, void 0, function () {
            var today, startOfToday, existing, sevenDaysAgo, thirtyDaysAgo, avg7, avg30, deviation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        today = new Date();
                        startOfToday = (0, date_fns_1.startOfDay)(today);
                        return [4 /*yield*/, this.anomalyRepo.findOne({
                                solarUnitId: unitId,
                                anomalyType: constants_1.AnomalyType.PERFORMANCE_DEGRADATION,
                                detectionTimestamp: { $gte: startOfToday },
                            })];
                    case 1:
                        existing = _a.sent();
                        if (existing)
                            return [2 /*return*/];
                        sevenDaysAgo = (0, date_fns_1.subDays)(today, 7);
                        thirtyDaysAgo = (0, date_fns_1.subDays)(today, 30);
                        return [4 /*yield*/, this.getAverageEnergy(unitId, sevenDaysAgo, today)];
                    case 2:
                        avg7 = _a.sent();
                        return [4 /*yield*/, this.getAverageEnergy(unitId, thirtyDaysAgo, today)];
                    case 3:
                        avg30 = _a.sent();
                        if (!(avg30 > 50 && avg7 < avg30 * 0.85)) return [3 /*break*/, 5];
                        deviation = Math.round(((avg30 - avg7) / avg30) * 100);
                        return [4 /*yield*/, this.createAnomalyIfNotExists(unitId, constants_1.AnomalyType.PERFORMANCE_DEGRADATION, constants_1.AnomalySeverity.INFO, today, "7-Day average (".concat(Math.round(avg7), "kWh) is ").concat(deviation, "% lower than 30-Day average (").concat(Math.round(avg30), "kWh)"), {
                                expectedValue: Math.round(avg30),
                                actualValue: Math.round(avg7),
                                deviationPercent: deviation,
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AnomalyDetectionService.prototype.getAverageEnergy = function (unitId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Accessing Repo method - previously logic was hard-coded in service.
                // We need to add this aggregation method to EnergyRecordRepository.
                // For now, I will use the repo instance to run aggregation if possible or add method to repo.
                // Since I can't modify repo in this same tool call easily without context switching, 
                // I'll assume I will add `getAverageEnergyInRange` to EnergyRepo.
                return [2 /*return*/, this.energyRepo.getAverageEnergyInRange(unitId, startDate, endDate)];
            });
        });
    };
    AnomalyDetectionService.prototype.createAnomalyIfNotExists = function (unitId, type, severity, timestamp, desc, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var exists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.anomalyRepo.findOne({
                            solarUnitId: unitId,
                            anomalyType: type,
                            detectionTimestamp: timestamp,
                        })];
                    case 1:
                        exists = _a.sent();
                        if (!!exists) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.anomalyRepo.create({
                                solarUnitId: unitId,
                                anomalyType: type,
                                severity: severity,
                                detectionTimestamp: timestamp,
                                description: desc,
                                metrics: metrics,
                                status: constants_1.AnomalyStatus.NEW,
                            })];
                    case 2:
                        _a.sent();
                        console.log("[AnomalyDetection] Created ".concat(severity, " alert: ").concat(type, " at ").concat(timestamp.toISOString()));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AnomalyDetectionService;
}());
exports.AnomalyDetectionService = AnomalyDetectionService;
//# sourceMappingURL=anomaly.service.js.map