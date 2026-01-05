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
var solar_unit_1 = require("../domain/dtos/solar-unit");
var SolarUnit_1 = require("../infrastructure/entities/SolarUnit");
var errors_1 = require("../domain/errors/errors");
var User_1 = require("../infrastructure/entities/User");
var express_1 = require("@clerk/express");
var anomaly_service_1 = require("../domain/services/anomaly.service");
var getAllSolarUnits = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var solarUnits, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, SolarUnit_1.SolarUnit.find()];
            case 1:
                solarUnits = _a.sent();
                res.status(200).json(solarUnits);
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
    var data, newSolarUnit, createdSolarUnit_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                data = req.body;
                newSolarUnit = {
                    serialNumber: data.serialNumber,
                    installationDate: new Date(data.installationDate),
                    capacity: data.capacity,
                    status: data.status,
                    location: data.location,
                    city: data.city,
                    country: data.country,
                };
                return [4 /*yield*/, SolarUnit_1.SolarUnit.create(newSolarUnit)];
            case 1:
                createdSolarUnit_1 = _a.sent();
                // Trigger asynchronous data seeding (fire and forget)
                // 1. Data API History
                triggerSeedHistory(createdSolarUnit_1.toObject()).catch(function (err) {
                    console.error("Failed to trigger history seed for ".concat(createdSolarUnit_1.serialNumber, ":"), err.message);
                });
                // 2. Local Backend Anomalies
                anomaly_service_1.AnomalyService.seedAnomaliesForUnit(createdSolarUnit_1.serialNumber).catch(function (err) {
                    console.error("Failed to seed anomalies for ".concat(createdSolarUnit_1.serialNumber, ":"), err.message);
                });
                res.status(201).json(createdSolarUnit_1);
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
// Helper: Call Data API to seed history
function triggerSeedHistory(solarUnit) {
    return __awaiter(this, void 0, void 0, function () {
        var DATA_API_URL, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    DATA_API_URL = process.env.DATA_API_URL || "http://localhost:8001";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Triggering history seed for ".concat(solarUnit.serialNumber, "..."));
                    return [4 /*yield*/, fetch("".concat(DATA_API_URL, "/api/energy-generation-records/seed-history"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(solarUnit)
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Seed API failed: ".concat(response.status, " ").concat(response.statusText));
                    }
                    else {
                        console.log("Seed API success for ".concat(solarUnit.serialNumber));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("Error calling Seed API:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var getSolarUnitById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, solarUnit, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findById(id)];
            case 1:
                solarUnit = _a.sent();
                if (!solarUnit) {
                    throw new errors_1.NotFoundError("Solar unit not found");
                }
                res.status(200).json(solarUnit);
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
    var auth, clerkUserId, user, solarUnits, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                auth = (0, express_1.getAuth)(req);
                clerkUserId = auth.userId;
                return [4 /*yield*/, User_1.User.findOne({ clerkUserId: clerkUserId })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new errors_1.NotFoundError("User not found");
                }
                return [4 /*yield*/, SolarUnit_1.SolarUnit.find({ userId: user._id })];
            case 2:
                solarUnits = _a.sent();
                res.status(200).json(solarUnits);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
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
    var id, _a, serialNumber, installationDate, capacity, status, userId, location, city, country, solarUnit, updatedSolarUnit;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, serialNumber = _a.serialNumber, installationDate = _a.installationDate, capacity = _a.capacity, status = _a.status, userId = _a.userId, location = _a.location, city = _a.city, country = _a.country;
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findById(id)];
            case 1:
                solarUnit = _b.sent();
                if (!solarUnit) {
                    throw new errors_1.NotFoundError("Solar unit not found");
                }
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findByIdAndUpdate(id, {
                        serialNumber: serialNumber,
                        installationDate: installationDate,
                        capacity: capacity,
                        status: status,
                        userId: userId,
                        location: location,
                        city: city,
                        country: country,
                    })];
            case 2:
                updatedSolarUnit = _b.sent();
                res.status(200).json(updatedSolarUnit);
                return [2 /*return*/];
        }
    });
}); };
exports.updateSolarUnit = updateSolarUnit;
var deleteSolarUnit = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, solarUnit, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findById(id)];
            case 1:
                solarUnit = _a.sent();
                if (!solarUnit) {
                    throw new errors_1.NotFoundError("Solar unit not found");
                }
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findByIdAndDelete(id)];
            case 2:
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                next(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteSolarUnit = deleteSolarUnit;
//# sourceMappingURL=solar-unit.js.map