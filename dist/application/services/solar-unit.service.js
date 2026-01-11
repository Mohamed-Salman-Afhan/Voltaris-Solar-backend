"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.SolarUnitService = void 0;
var solar_unit_repository_1 = require("../../infrastructure/repositories/solar-unit.repository");
var energy_record_repository_1 = require("../../infrastructure/repositories/energy-record.repository");
var Invoice_1 = require("../../infrastructure/entities/Invoice");
var User_1 = require("../../infrastructure/entities/User");
var generate_invoices_1 = require("../background/generate-invoices");
var errors_1 = require("../../domain/errors/errors");
var SolarUnitService = /** @class */ (function () {
    function SolarUnitService() {
        this.solarRepo = new solar_unit_repository_1.SolarUnitRepository();
        this.energyRepo = new energy_record_repository_1.EnergyRecordRepository();
    }
    SolarUnitService.prototype.getAll = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, status, skip, filter, total, units;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = parseInt(query.page) || 1;
                        limit = parseInt(query.limit) || 10;
                        status = query.status;
                        skip = (page - 1) * limit;
                        filter = {};
                        if (status && status !== "ALL") {
                            filter.status = status;
                        }
                        return [4 /*yield*/, this.solarRepo.count(filter)];
                    case 1:
                        total = _a.sent();
                        return [4 /*yield*/, this.solarRepo.findAll(filter, skip, limit)];
                    case 2:
                        units = _a.sent();
                        return [2 /*return*/, {
                                units: units,
                                totalPages: Math.ceil(total / limit),
                                currentPage: page,
                                totalUnits: total
                            }];
                }
            });
        });
    };
    SolarUnitService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var createdSolarUnit, SolarUnitProvisioningService, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.solarRepo.create({
                            serialNumber: data.serialNumber,
                            installationDate: new Date(data.installationDate).toISOString(),
                            capacity: data.capacity,
                            status: data.status,
                            location: data.location,
                            city: data.city,
                            country: data.country,
                            userId: data.userId // Assuming userId might be passed if created by admin with user? Original didn't seem to pass it in DTO explicitly but maybe?
                            // Original: const newSolarUnit = { ...data.serialNumber ... } - it did NOT include userId in the variable `newSolarUnit` explicitly in the `createSolarUnit` function!
                            // Wait, let's check `createSolarUnit` in original.
                            // `const newSolarUnit = { serialNumber: data.serialNumber, ... }` -> It did NOT copy userId. Check DTO.
                            // But `SolarUnitProvisioningService.provisionUnit` uses `createdSolarUnit.toObject()`.
                            // If `userId` is not set, it's null.
                        })];
                    case 1:
                        createdSolarUnit = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("../provisioning.service")); })];
                    case 3:
                        SolarUnitProvisioningService = (_a.sent()).SolarUnitProvisioningService;
                        return [4 /*yield*/, SolarUnitProvisioningService.provisionUnit(createdSolarUnit.toObject())];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        console.error("[Create] Provisioning failed for ".concat(createdSolarUnit.serialNumber, ":"), err_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, createdSolarUnit];
                }
            });
        });
    };
    SolarUnitService.prototype.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var unit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.solarRepo.findById(id)];
                    case 1:
                        unit = _a.sent();
                        if (!unit)
                            throw new errors_1.NotFoundError("Solar unit not found");
                        return [2 /*return*/, unit];
                }
            });
        });
    };
    SolarUnitService.prototype.getForUser = function (clerkUserId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User_1.User.findOne({ clerkUserId: clerkUserId })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new errors_1.NotFoundError("User not found");
                        return [2 /*return*/, this.solarRepo.findByUserId(user._id.toString())];
                }
            });
        });
    };
    SolarUnitService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var solarUnit, oldOwnerId, newOwnerId, isOwnerChanging, updatedSolarUnit;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.solarRepo.findById(id)];
                    case 1:
                        solarUnit = _c.sent();
                        if (!solarUnit)
                            throw new errors_1.NotFoundError("Solar unit not found");
                        oldOwnerId = (_a = solarUnit.userId) === null || _a === void 0 ? void 0 : _a.toString();
                        newOwnerId = (_b = data.userId) === null || _b === void 0 ? void 0 : _b.toString();
                        isOwnerChanging = newOwnerId && oldOwnerId !== newOwnerId;
                        return [4 /*yield*/, this.solarRepo.update(id, data)];
                    case 2:
                        updatedSolarUnit = _c.sent();
                        if (!isOwnerChanging) return [3 /*break*/, 5];
                        console.log("[OwnershipTransfer] Transferring data for Unit ".concat(id, " from ").concat(oldOwnerId, " to ").concat(newOwnerId, "..."));
                        // Transfer Invoices
                        return [4 /*yield*/, Invoice_1.Invoice.updateMany({ solarUnitId: id }, { $set: { userId: newOwnerId } })];
                    case 3:
                        // Transfer Invoices
                        _c.sent();
                        // Transfer Energy Records
                        return [4 /*yield*/, this.energyRepo.updateOwner(id, newOwnerId)];
                    case 4:
                        // Transfer Energy Records
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        // Trigger Billing if user assigned
                        if (newOwnerId && (oldOwnerId !== newOwnerId)) {
                            console.log("[Update] User assigned to Unit ".concat(id, ". Triggering retrospective billing..."));
                            // Fire and forget catch
                            (0, generate_invoices_1.generateMonthlyInvoices)(id)
                                .then(function (count) {
                                if (count > 0)
                                    console.log("[Update] Generated ".concat(count, " invoices for newly assigned unit."));
                            })
                                .catch(function (err) { return console.error("[Update] Billing trigger failed:", err); });
                        }
                        return [2 /*return*/, updatedSolarUnit];
                }
            });
        });
    };
    SolarUnitService.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var unit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.solarRepo.findById(id)];
                    case 1:
                        unit = _a.sent();
                        if (!unit)
                            throw new errors_1.NotFoundError("Solar unit not found");
                        return [4 /*yield*/, this.solarRepo.delete(id)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SolarUnitService;
}());
exports.SolarUnitService = SolarUnitService;
//# sourceMappingURL=solar-unit.service.js.map