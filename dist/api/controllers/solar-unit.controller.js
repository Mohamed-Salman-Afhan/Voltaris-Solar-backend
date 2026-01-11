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
exports.deleteSolarUnit = exports.updateSolarUnit = exports.updateSolarUnitValidator = exports.getSolarUnitForUser = exports.getSolarUnitById = exports.createSolarUnit = exports.createSolarUnitValidator = exports.getAllSolarUnits = void 0;
var solar_unit_service_1 = require("../../application/services/solar-unit.service");
var solar_unit_1 = require("../../domain/dtos/solar-unit");
var errors_1 = require("../../domain/errors/errors");
var express_1 = require("@clerk/express");
var solarService = new solar_unit_service_1.SolarUnitService();
var getAllSolarUnits = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, solarService.getAll(req.query)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllSolarUnits = getAllSolarUnits;
var createSolarUnitValidator = function (req, res, next) {
    var result = solar_unit_1.CreateSolarUnitDto.safeParse(req.body);
    if (!result.success) {
        throw new errors_1.ValidationError(result.error.message);
    }
    next();
};
exports.createSolarUnitValidator = createSolarUnitValidator;
var createSolarUnit = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, solarService.create(req.body)];
            case 1:
                result = _a.sent();
                res.status(201).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                if (error_2.code === 11000) {
                    return [2 /*return*/, res.status(409).json({ message: "Solar unit with this Serial Number already exists" })];
                }
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createSolarUnit = createSolarUnit;
var getSolarUnitById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, solarService.getById(req.params.id)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                next(error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSolarUnitById = getSolarUnitById;
var getSolarUnitForUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var auth, clerkUserId, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                auth = (0, express_1.getAuth)(req);
                clerkUserId = auth.userId;
                if (!clerkUserId)
                    throw new errors_1.ValidationError("Unauthorized");
                return [4 /*yield*/, solarService.getForUser(clerkUserId)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSolarUnitForUser = getSolarUnitForUser;
var updateSolarUnitValidator = function (req, res, next) {
    var result = solar_unit_1.UpdateSolarUnitDto.safeParse(req.body);
    if (!result.success) {
        throw new errors_1.ValidationError(result.error.message);
    }
    next();
};
exports.updateSolarUnitValidator = updateSolarUnitValidator;
var updateSolarUnit = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, solarService.update(req.params.id, req.body)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                next(error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateSolarUnit = updateSolarUnit;
var deleteSolarUnit = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, solarService.delete(req.params.id)];
            case 1:
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteSolarUnit = deleteSolarUnit;
//# sourceMappingURL=solar-unit.controller.js.map