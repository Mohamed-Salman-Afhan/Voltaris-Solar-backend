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
var anomaly_detection_1 = require("../anomaly-detection");
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
var syncEnergyGenerationRecords = function () { return __awaiter(void 0, void 0, void 0, function () {
    var solarUnits, _loop_1, _i, solarUnits_1, solarUnit, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, SolarUnit_1.SolarUnit.find()];
            case 1:
                solarUnits = _a.sent();
                _loop_1 = function (solarUnit) {
                    var lastSyncedRecord, baseUrl, url, dataAPIResponse, newRecords, _b, _c, recordsToInsert;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0: return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord
                                    .findOne({ solarUnitId: solarUnit._id })
                                    .sort({ timestamp: -1 })];
                            case 1:
                                lastSyncedRecord = _d.sent();
                                baseUrl = "http://localhost:8001/api/energy-generation-records/solar-unit/".concat(solarUnit.serialNumber);
                                url = new URL(baseUrl);
                                if (lastSyncedRecord === null || lastSyncedRecord === void 0 ? void 0 : lastSyncedRecord.timestamp) {
                                    url.searchParams.append('sinceTimestamp', lastSyncedRecord.timestamp.toISOString());
                                }
                                return [4 /*yield*/, fetch(url.toString())];
                            case 2:
                                dataAPIResponse = _d.sent();
                                if (!dataAPIResponse.ok) {
                                    throw new Error("Failed to fetch energy generation records from data API");
                                }
                                _c = (_b = exports.DataAPIEnergyGenerationRecordDto
                                    .array())
                                    .parse;
                                return [4 /*yield*/, dataAPIResponse.json()];
                            case 3:
                                newRecords = _c.apply(_b, [_d.sent()]);
                                if (!(newRecords.length > 0)) return [3 /*break*/, 6];
                                recordsToInsert = newRecords.map(function (record) { return ({
                                    solarUnitId: solarUnit._id,
                                    energyGenerated: record.energyGenerated,
                                    timestamp: new Date(record.timestamp),
                                    intervalHours: record.intervalHours,
                                }); });
                                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.insertMany(recordsToInsert)];
                            case 4:
                                _d.sent();
                                console.log("Synced ".concat(recordsToInsert.length, " new energy generation records"));
                                // Trigger Anomaly Detection (Requirement 5.2)
                                return [4 /*yield*/, anomaly_detection_1.AnomalyDetectionService.analyzeRecords(recordsToInsert)];
                            case 5:
                                // Trigger Anomaly Detection (Requirement 5.2)
                                _d.sent();
                                return [3 /*break*/, 7];
                            case 6:
                                console.log("No new records to sync");
                                _d.label = 7;
                            case 7: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, solarUnits_1 = solarUnits;
                _a.label = 2;
            case 2:
                if (!(_i < solarUnits_1.length)) return [3 /*break*/, 5];
                solarUnit = solarUnits_1[_i];
                return [5 /*yield**/, _loop_1(solarUnit)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error("Sync Job error:", error_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.syncEnergyGenerationRecords = syncEnergyGenerationRecords;
//# sourceMappingURL=sync-energy-generation-records.js.map