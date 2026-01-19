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
exports.syncEnergyGenerationRecords = exports.DataAPIEnergyGenerationRecordDto = void 0;
var zod_1 = require("zod");
var EnergyGenerationRecord_1 = require("../../infrastructure/entities/EnergyGenerationRecord");
var SolarUnit_1 = require("../../infrastructure/entities/SolarUnit");
var anomaly_service_1 = require("../services/anomaly.service");
exports.DataAPIEnergyGenerationRecordDto = zod_1.z.object({
    _id: zod_1.z.string(),
    serialNumber: zod_1.z.string(),
    energyGenerated: zod_1.z.number(),
    timestamp: zod_1.z.string(),
    intervalHours: zod_1.z.number(),
    __v: zod_1.z.number(),
});
/**
 * Synchronizes energy generation records from the data API
 * Fetches latest records and merges new data with existing records
 */
var processSolarUnit = function (solarUnit) { return __awaiter(void 0, void 0, void 0, function () {
    var hasMoreData, batchCount, BATCH_LIMIT, lastSyncedRecord, rawUrl, dataApiUrl, url, dataAPIResponse, newRecords, _a, _b, recordsToInsert, anomalyService, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 10, , 11]);
                hasMoreData = true;
                batchCount = 0;
                BATCH_LIMIT = 1000;
                _c.label = 1;
            case 1:
                if (!hasMoreData) return [3 /*break*/, 9];
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord
                        .findOne({ solarUnitId: solarUnit._id })
                        .sort({ timestamp: -1 })];
            case 2:
                lastSyncedRecord = _c.sent();
                rawUrl = process.env.DATA_API_URL || "http://localhost:8001";
                dataApiUrl = rawUrl.replace(/\/$/, "");
                url = new URL("".concat(dataApiUrl, "/api/energy-generation-records/solar-unit/").concat(solarUnit.serialNumber));
                if (lastSyncedRecord === null || lastSyncedRecord === void 0 ? void 0 : lastSyncedRecord.timestamp) {
                    url.searchParams.append('sinceTimestamp', lastSyncedRecord.timestamp.toISOString());
                }
                return [4 /*yield*/, fetch(url.toString(), {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Accept": "application/json",
                            "Accept-Language": "en-US,en;q=0.9",
                        }
                    })];
            case 3:
                dataAPIResponse = _c.sent();
                if (!dataAPIResponse.ok) {
                    console.warn("Failed to fetch energy records for ".concat(solarUnit.serialNumber, ": ").concat(dataAPIResponse.statusText));
                    hasMoreData = false; // Stop loop on error
                    return [3 /*break*/, 9];
                }
                _b = (_a = exports.DataAPIEnergyGenerationRecordDto
                    .array())
                    .parse;
                return [4 /*yield*/, dataAPIResponse.json()];
            case 4:
                newRecords = _b.apply(_a, [_c.sent()]);
                if (!(newRecords.length > 0)) return [3 /*break*/, 7];
                recordsToInsert = newRecords.map(function (record) { return ({
                    solarUnitId: solarUnit._id,
                    energyGenerated: record.energyGenerated,
                    timestamp: new Date(record.timestamp),
                    intervalHours: record.intervalHours,
                }); });
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.insertMany(recordsToInsert)];
            case 5:
                _c.sent();
                batchCount++;
                console.log("[Sync] Batch ".concat(batchCount, ": Synced ").concat(recordsToInsert.length, " records for ").concat(solarUnit.serialNumber));
                anomalyService = new anomaly_service_1.AnomalyDetectionService();
                return [4 /*yield*/, anomalyService.analyzeRecords(recordsToInsert)];
            case 6:
                _c.sent();
                // If we received fewer records than the limit, we are caught up
                if (newRecords.length < BATCH_LIMIT) {
                    hasMoreData = false;
                }
                return [3 /*break*/, 8];
            case 7:
                console.log("[Sync] No new records for ".concat(solarUnit.serialNumber));
                hasMoreData = false;
                _c.label = 8;
            case 8: return [3 /*break*/, 1];
            case 9: return [3 /*break*/, 11];
            case 10:
                error_1 = _c.sent();
                console.error("Error processing solar unit ".concat(solarUnit.serialNumber, ":"), error_1);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
/**
 * Synchronizes energy generation records from the data API
 * Fetches latest records and merges new data with existing records
 */
var syncEnergyGenerationRecords = function (specificSolarUnitId) { return __awaiter(void 0, void 0, void 0, function () {
    var query, solarUnits, _i, solarUnits_1, unit, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                query = specificSolarUnitId ? { _id: specificSolarUnitId } : {};
                return [4 /*yield*/, SolarUnit_1.SolarUnit.find(query)];
            case 1:
                solarUnits = _a.sent();
                // Process SEQUENTIALLY to avoid hitting Data API rate limits (429)
                // especially on startup when syncing all units.
                console.log("[Sync Job] Found ".concat(solarUnits.length, " solar units to sync."));
                _i = 0, solarUnits_1 = solarUnits;
                _a.label = 2;
            case 2:
                if (!(_i < solarUnits_1.length)) return [3 /*break*/, 6];
                unit = solarUnits_1[_i];
                return [4 /*yield*/, processSolarUnit(unit)];
            case 3:
                _a.sent();
                // Add a small delay between units to be nice to the API
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
            case 4:
                // Add a small delay between units to be nice to the API
                _a.sent();
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_2 = _a.sent();
                console.error("Sync Job error:", error_2);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.syncEnergyGenerationRecords = syncEnergyGenerationRecords;
//# sourceMappingURL=sync-energy-generation-records.js.map