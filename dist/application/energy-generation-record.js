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
exports.getAllEnergyGenerationRecordsBySolarUnitId = void 0;
var solar_unit_1 = require("../domain/dtos/solar-unit");
var errors_1 = require("../domain/errors/errors");
var EnergyGenerationRecord_1 = require("../infrastructure/entities/EnergyGenerationRecord");
var mongoose_1 = __importDefault(require("mongoose"));
var getAllEnergyGenerationRecordsBySolarUnitId = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, results, _a, groupBy, limit, limitNum, energyGenerationRecords, pipeline, energyGenerationRecords, pipeline, energyGenerationRecords, pipeline, energyGenerationRecords, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 9, , 10]);
                id = req.params.id;
                results = solar_unit_1.GetAllEnergyGenerationRecordsQueryDto.safeParse(req.query);
                if (!results.success) {
                    throw new errors_1.ValidationError(results.error.message);
                }
                _a = results.data, groupBy = _a.groupBy, limit = _a.limit;
                limitNum = limit ? parseInt(limit) : 7;
                if (!!groupBy) return [3 /*break*/, 2];
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.find({
                        solarUnitId: id,
                    }).sort({ timestamp: -1 })];
            case 1:
                energyGenerationRecords = _b.sent();
                return [2 /*return*/, res.status(200).json(energyGenerationRecords)];
            case 2:
                if (!(groupBy === "date")) return [3 /*break*/, 4];
                pipeline = [
                    { $match: { solarUnitId: new mongoose_1.default.Types.ObjectId(id) } },
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                                },
                            },
                            totalEnergy: { $sum: "$energyGenerated" },
                        },
                    },
                    { $sort: { "_id.date": -1 } },
                ];
                if (limit) {
                    pipeline.push({ $limit: limitNum });
                }
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.aggregate(pipeline)];
            case 3:
                energyGenerationRecords = _b.sent();
                return [2 /*return*/, res.status(200).json(energyGenerationRecords)];
            case 4:
                if (!(groupBy === "hour")) return [3 /*break*/, 6];
                pipeline = [
                    { $match: { solarUnitId: new mongoose_1.default.Types.ObjectId(id) } },
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" },
                                },
                            },
                            totalEnergy: { $sum: "$energyGenerated" },
                        }
                    },
                    { $sort: { "_id.date": -1 } }
                ];
                if (limit) {
                    pipeline.push({ $limit: limitNum });
                }
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.aggregate(pipeline)];
            case 5:
                energyGenerationRecords = _b.sent();
                return [2 /*return*/, res.status(200).json(energyGenerationRecords)];
            case 6:
                if (!(groupBy === "weekly")) return [3 /*break*/, 8];
                pipeline = [
                    { $match: { solarUnitId: new mongoose_1.default.Types.ObjectId(id) } },
                    {
                        $group: {
                            _id: {
                                // Returns Year-Week e.g. "2025-05"
                                date: { $dateToString: { format: "%G-W%V", date: "$timestamp" } }
                            },
                            totalEnergy: { $sum: "$energyGenerated" },
                        }
                    },
                    { $sort: { "_id.date": -1 } }
                ];
                if (limit) {
                    pipeline.push({ $limit: limitNum });
                }
                return [4 /*yield*/, EnergyGenerationRecord_1.EnergyGenerationRecord.aggregate(pipeline)];
            case 7:
                energyGenerationRecords = _b.sent();
                return [2 /*return*/, res.status(200).json(energyGenerationRecords)];
            case 8: return [3 /*break*/, 10];
            case 9:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.getAllEnergyGenerationRecordsBySolarUnitId = getAllEnergyGenerationRecordsBySolarUnitId;
//# sourceMappingURL=energy-generation-record.js.map