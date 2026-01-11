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
exports.SolarUnitProvisioningService = void 0;
var EnergyGenerationRecord_1 = require("../infrastructure/entities/EnergyGenerationRecord");
var anomaly_service_1 = require("./services/anomaly.service");
var sync_energy_generation_records_1 = require("./background/sync-energy-generation-records");
var generate_invoices_1 = require("./background/generate-invoices");
var SolarUnitProvisioningService = /** @class */ (function () {
    function SolarUnitProvisioningService() {
    }
    /**
     * Orchestrates the full lifecycle of a new Solar Unit:
     * 1. Seed History (Data API)
     * 2. Sync Records (Data API -> Local DB)
     * 3. Anomaly Detection
     * 4. Retrospective Billing
     */
    SolarUnitProvisioningService.provisionUnit = function (solarUnit) {
        return __awaiter(this, void 0, void 0, function () {
            var historyRecords, anomalyService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Provisioning] Starting pipeline for ".concat(solarUnit.serialNumber, "..."));
                        // Step 1: Seed History
                        return [4 /*yield*/, this.triggerSeedHistory(solarUnit)];
                    case 1:
                        // Step 1: Seed History
                        _a.sent();
                        // Step 2: Sync Data (with verification)
                        return [4 /*yield*/, this.syncWithRetry(solarUnit)];
                    case 2:
                        // Step 2: Sync Data (with verification)
                        _a.sent();
                        return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.find({ solarUnitId: solarUnit._id })];
                    case 3:
                        historyRecords = _a.sent();
                        if (!(historyRecords.length > 0)) return [3 /*break*/, 5];
                        console.log("[Provisioning] Analyzing ".concat(historyRecords.length, " records..."));
                        anomalyService = new anomaly_service_1.AnomalyDetectionService();
                        return [4 /*yield*/, anomalyService.analyzeRecords(historyRecords)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        console.warn("[Provisioning] No records found after sync for ".concat(solarUnit.serialNumber, ". Skipping analysis."));
                        _a.label = 6;
                    case 6: 
                    // Step 4: Billing
                    return [4 /*yield*/, this.billingWithRetry(solarUnit._id.toString())];
                    case 7:
                        // Step 4: Billing
                        _a.sent();
                        console.log("[Provisioning] Pipeline complete for ".concat(solarUnit.serialNumber, "."));
                        return [2 /*return*/];
                }
            });
        });
    };
    SolarUnitProvisioningService.triggerSeedHistory = function (solarUnit) {
        return __awaiter(this, void 0, void 0, function () {
            var DATA_API_URL, response, errText, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        DATA_API_URL = process.env.DATA_API_URL || "http://localhost:8001";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        console.log("[Provisioning] Seeding history...");
                        return [4 /*yield*/, fetch("".concat(DATA_API_URL, "/api/energy-generation-records/seed-history"), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(solarUnit)
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errText = _a.sent();
                        throw new Error("Seed API failed (".concat(response.status, ") at ").concat(DATA_API_URL, ": ").concat(errText.substring(0, 200)));
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        console.error("[Provisioning] Seed Error:", err_1);
                        throw err_1; // Propagate error to stop the pipeline
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SolarUnitProvisioningService.syncWithRetry = function (solarUnit) {
        return __awaiter(this, void 0, void 0, function () {
            var recordsFound, MAX_RETRIES, i, count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recordsFound = false;
                        MAX_RETRIES = 5;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < MAX_RETRIES)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, sync_energy_generation_records_1.syncEnergyGenerationRecords)(solarUnit._id.toString())];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.countDocuments({ solarUnitId: solarUnit._id })];
                    case 3:
                        count = _a.sent();
                        if (count > 0) {
                            console.log("[Provisioning] Verified ".concat(count, " records synced."));
                            recordsFound = true;
                            return [3 /*break*/, 6];
                        }
                        console.log("[Provisioning] No records yet. Retrying sync (".concat(i + 1, "/").concat(MAX_RETRIES, ")..."));
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (!recordsFound)
                            console.warn("[Provisioning] Data sync verification failed. Proceeding anyway.");
                        return [2 /*return*/];
                }
            });
        });
    };
    SolarUnitProvisioningService.billingWithRetry = function (unitId) {
        return __awaiter(this, void 0, void 0, function () {
            var MAX_RETRIES, i, count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        MAX_RETRIES = 5;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < MAX_RETRIES)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, generate_invoices_1.generateMonthlyInvoices)(unitId)];
                    case 2:
                        count = _a.sent();
                        if (count > 0) {
                            console.log("[Provisioning] Created ".concat(count, " invoices."));
                            return [2 /*return*/];
                        }
                        console.log("[Provisioning] No invoices generated. Retrying billing (".concat(i + 1, "/").concat(MAX_RETRIES, ")..."));
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5:
                        console.warn("[Provisioning] Billing retry exhausted. No invoices created.");
                        return [2 /*return*/];
                }
            });
        });
    };
    return SolarUnitProvisioningService;
}());
exports.SolarUnitProvisioningService = SolarUnitProvisioningService;
//# sourceMappingURL=provisioning.service.js.map