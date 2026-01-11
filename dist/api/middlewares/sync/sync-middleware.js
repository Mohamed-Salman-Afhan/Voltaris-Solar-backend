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
exports.syncMiddleware = exports.DataAPIEnergyGenerationRecordDto = void 0;
var express_1 = require("@clerk/express");
var errors_1 = require("../../../domain/errors/errors");
var User_1 = require("../../../infrastructure/entities/User");
var SolarUnit_1 = require("../../../infrastructure/entities/SolarUnit");
var EnergyGenerationRecord_1 = require("../../../infrastructure/entities/EnergyGenerationRecord");
var zod_1 = require("zod");
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
var syncMiddleware = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, user, solarUnit_1, dataApiUrl, url, dataAPIResponse, error_1, respText, latestEnergyGenerationRecords, _a, _b, lastSyncedRecord_1, newRecords, recordsToInsert, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 14, , 15]);
                auth = (0, express_1.getAuth)(req);
                return [4 /*yield*/, User_1.User.findOne({ clerkUserId: auth.userId })];
            case 1:
                user = _c.sent();
                if (!user) {
                    throw new errors_1.NotFoundError("User not found");
                }
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findOne({ userId: user._id })];
            case 2:
                solarUnit_1 = _c.sent();
                if (!solarUnit_1) {
                    throw new errors_1.NotFoundError("Solar unit not found");
                }
                dataApiUrl = process.env.DATA_API_URL || "http://localhost:8001";
                url = "".concat(dataApiUrl, "/api/energy-generation-records/solar-unit/").concat(solarUnit_1.serialNumber);
                dataAPIResponse = void 0;
                _c.label = 3;
            case 3:
                _c.trys.push([3, 5, , 6]);
                return [4 /*yield*/, fetch(url)];
            case 4:
                dataAPIResponse = _c.sent();
                return [3 /*break*/, 6];
            case 5:
                error_1 = _c.sent();
                console.error("[SyncMiddleware] Failed to connect to Data API at ".concat(url), error_1);
                // Verify if non-critical: currently we treat sync failure as non-critical for dashboard loading
                return [2 /*return*/, next()];
            case 6:
                if (!!dataAPIResponse.ok) return [3 /*break*/, 8];
                return [4 /*yield*/, dataAPIResponse.text().catch(function () { return "<unreadable>"; })];
            case 7:
                respText = _c.sent();
                console.warn("[SyncMiddleware] Data API returned error: ".concat(dataAPIResponse.status, " - ").concat(respText));
                return [2 /*return*/, next()];
            case 8:
                _b = (_a = exports.DataAPIEnergyGenerationRecordDto
                    .array())
                    .parse;
                return [4 /*yield*/, dataAPIResponse.json()];
            case 9:
                latestEnergyGenerationRecords = _b.apply(_a, [_c.sent()]);
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord
                        .findOne({ solarUnitId: solarUnit_1._id })
                        .sort({ timestamp: -1 })];
            case 10:
                lastSyncedRecord_1 = _c.sent();
                newRecords = latestEnergyGenerationRecords.filter(function (apiRecord) {
                    if (!lastSyncedRecord_1)
                        return true; // First sync, add all
                    return new Date(apiRecord.timestamp) > lastSyncedRecord_1.timestamp;
                });
                if (!(newRecords.length > 0)) return [3 /*break*/, 12];
                recordsToInsert = newRecords.map(function (record) { return ({
                    solarUnitId: solarUnit_1._id,
                    energyGenerated: record.energyGenerated,
                    timestamp: new Date(record.timestamp),
                    intervalHours: record.intervalHours,
                }); });
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.insertMany(recordsToInsert)];
            case 11:
                _c.sent();
                console.log("Synced ".concat(recordsToInsert.length, " new energy generation records"));
                return [3 /*break*/, 13];
            case 12:
                console.log("No new records to sync");
                _c.label = 13;
            case 13:
                next();
                return [3 /*break*/, 15];
            case 14:
                error_2 = _c.sent();
                console.error("Sync middleware error:", error_2);
                next(error_2);
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); };
exports.syncMiddleware = syncMiddleware;
//# sourceMappingURL=sync-middleware.js.map