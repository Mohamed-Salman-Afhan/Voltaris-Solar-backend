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
exports.anomalyRouter = void 0;
var express_1 = __importDefault(require("express"));
var Anomaly_1 = require("../infrastructure/entities/Anomaly");
var custom_errors_1 = require("../domain/errors/custom-errors");
var zod_1 = require("zod");
var router = express_1.default.Router();
exports.anomalyRouter = router;
// GET /api/anomalies/unit/:unitId
// Get anomalies for a specific unit
router.get('/unit/:unitId', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var unitId, _a, status, severity, query, anomalies, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                unitId = req.params.unitId;
                _a = req.query, status = _a.status, severity = _a.severity;
                query = { solarUnitId: unitId };
                if (status)
                    query.status = status;
                if (severity)
                    query.severity = severity;
                return [4 /*yield*/, Anomaly_1.Anomaly.find(query).sort({ detectionTimestamp: -1 })];
            case 1:
                anomalies = _b.sent();
                res.json({
                    success: true,
                    data: anomalies
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/anomalies/admin
// Get all anomalies (Admin view)
router.get('/admin', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, status, type, severity, page, limit, skip, query, total, anomalies, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.query, status = _a.status, type = _a.type, severity = _a.severity;
                page = parseInt(req.query.page) || 1;
                limit = parseInt(req.query.limit) || 10;
                skip = (page - 1) * limit;
                query = {};
                if (status && status !== 'ALL')
                    query.status = status;
                if (type && type !== 'ALL')
                    query.anomalyType = type;
                if (severity && severity !== 'ALL')
                    query.severity = severity;
                return [4 /*yield*/, Anomaly_1.Anomaly.countDocuments(query)];
            case 1:
                total = _b.sent();
                return [4 /*yield*/, Anomaly_1.Anomaly.find(query)
                        .populate('solarUnitId', 'serialNumber')
                        .sort({ detectionTimestamp: -1 })
                        .skip(skip)
                        .limit(limit)];
            case 2:
                anomalies = _b.sent();
                res.json({
                    success: true,
                    data: anomalies,
                    meta: {
                        totalPages: Math.ceil(total / limit),
                        currentPage: page,
                        total: total
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                next(error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// PATCH /api/anomalies/:anomalyId
// Update status (Acknowledge/Resolve)
var UpdateAnomalySchema = zod_1.z.object({
    status: zod_1.z.enum(['NEW', 'ACKNOWLEDGED', 'RESOLVED']),
    resolutionNotes: zod_1.z.string().optional()
});
router.patch('/:anomalyId', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var anomalyId, body, anomaly, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                anomalyId = req.params.anomalyId;
                body = UpdateAnomalySchema.parse(req.body);
                return [4 /*yield*/, Anomaly_1.Anomaly.findByIdAndUpdate(anomalyId, {
                        status: body.status,
                        resolutionNotes: body.resolutionNotes
                    }, { new: true })];
            case 1:
                anomaly = _a.sent();
                if (!anomaly) {
                    throw new custom_errors_1.NotFoundError("Anomaly alert not found");
                }
                res.json({
                    success: true,
                    data: anomaly
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=anomalies.js.map