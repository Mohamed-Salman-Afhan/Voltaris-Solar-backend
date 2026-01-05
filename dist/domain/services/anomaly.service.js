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
exports.AnomalyService = void 0;
var Anomaly_1 = require("../../infrastructure/entities/Anomaly");
var SolarUnit_1 = require("../../infrastructure/entities/SolarUnit");
var AnomalyService = /** @class */ (function () {
    function AnomalyService() {
    }
    /**
     * Generates sample anomalies for a given solar unit to populate the dashboard.
     */
    AnomalyService.seedAnomaliesForUnit = function (serialNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var unit, now, anomalies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Seeding anomalies for unit: ".concat(serialNumber));
                        return [4 /*yield*/, SolarUnit_1.SolarUnit.findOne({ serialNumber: serialNumber })];
                    case 1:
                        unit = _a.sent();
                        if (!unit) {
                            throw new Error("Solar Unit ".concat(serialNumber, " not found locally in backend."));
                        }
                        now = new Date();
                        anomalies = [
                            {
                                solarUnitId: unit._id,
                                anomalyType: 'PERFORMANCE_DEGRADATION',
                                severity: 'WARNING',
                                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
                                description: 'Persistent low output detected (85% of expected) over 48h.',
                                metrics: {
                                    expectedValue: 4500,
                                    actualValue: 3800,
                                    deviationPercent: 15
                                },
                                status: 'RESOLVED',
                                resolutionNotes: 'Cleaned panels.'
                            },
                            {
                                solarUnitId: unit._id,
                                anomalyType: 'ERRATIC_FLUCTUATION',
                                severity: 'INFO',
                                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12), // 12 hours ago
                                description: 'Minor voltage fluctuations detected during cloud cover.',
                                metrics: {
                                    expectedValue: 300,
                                    actualValue: 280,
                                    deviationPercent: 6
                                },
                                status: 'ACKNOWLEDGED'
                            },
                            {
                                solarUnitId: unit._id,
                                anomalyType: 'ZERO_GENERATION',
                                severity: 'CRITICAL',
                                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
                                description: 'Inverter reported 0W output during peak sun hours.',
                                metrics: {
                                    expectedValue: 4200,
                                    actualValue: 0,
                                    deviationPercent: 100
                                },
                                status: 'NEW'
                            },
                            {
                                solarUnitId: unit._id,
                                anomalyType: 'INVERTER_OFFLINE',
                                severity: 'CRITICAL',
                                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
                                description: 'Inverter unresponsive to keep-alive pings.',
                                metrics: {
                                    expectedValue: 1,
                                    actualValue: 0,
                                    deviationPercent: 100
                                },
                                status: 'RESOLVED',
                                resolutionNotes: 'Firmware reset.'
                            },
                            {
                                solarUnitId: unit._id,
                                anomalyType: 'PANEL_SHADING',
                                severity: 'WARNING',
                                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 mins ago
                                description: 'Partial shading pattern detected on String 2.',
                                metrics: {
                                    expectedValue: 3500,
                                    actualValue: 2800,
                                    deviationPercent: 20
                                },
                                status: 'NEW'
                            },
                            {
                                solarUnitId: unit._id,
                                anomalyType: 'GRID_INSTABILITY',
                                severity: 'INFO',
                                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3), // 3 hours ago
                                description: 'Grid frequency deviation detected (>0.5Hz).',
                                metrics: {
                                    expectedValue: 60,
                                    actualValue: 60.8,
                                    deviationPercent: 1.3
                                },
                                status: 'ACKNOWLEDGED'
                            },
                            {
                                solarUnitId: unit._id,
                                anomalyType: 'TEMPERATURE_OVERHEAT',
                                severity: 'WARNING',
                                detectionTimestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
                                description: 'Panel temperature exceeding operational norm (75°C).',
                                metrics: {
                                    expectedValue: 45,
                                    actualValue: 78,
                                    deviationPercent: 73
                                },
                                status: 'NEW'
                            }
                        ];
                        // Delete existing anomalies for this unit to avoid duplicates during repeated seeding
                        return [4 /*yield*/, Anomaly_1.Anomaly.deleteMany({ solarUnitId: unit._id })];
                    case 2:
                        // Delete existing anomalies for this unit to avoid duplicates during repeated seeding
                        _a.sent();
                        // Insert new sample anomalies
                        return [4 /*yield*/, Anomaly_1.Anomaly.insertMany(anomalies)];
                    case 3:
                        // Insert new sample anomalies
                        _a.sent();
                        console.log("Successfully seeded ".concat(anomalies.length, " anomalies for ").concat(serialNumber));
                        return [2 /*return*/];
                }
            });
        });
    };
    return AnomalyService;
}());
exports.AnomalyService = AnomalyService;
//# sourceMappingURL=anomaly.service.js.map