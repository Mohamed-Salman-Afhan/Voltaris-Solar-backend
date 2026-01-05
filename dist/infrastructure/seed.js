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
var mongoose_1 = __importDefault(require("mongoose"));
var SolarUnit_1 = require("./entities/SolarUnit");
var Anomaly_1 = require("./entities/Anomaly");
var CapacityFactorRecord_1 = require("./entities/CapacityFactorRecord");
var WeatherData_1 = require("./entities/WeatherData");
var User_1 = require("./entities/User");
var dotenv_1 = __importDefault(require("dotenv"));
var db_1 = require("./db");
dotenv_1.default.config();
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var user, userId, solarUnit, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, 9, 11]);
                    // Connect to DB
                    return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    // Connect to DB
                    _a.sent();
                    console.log("Clearing existing data...");
                    // Clear operational data
                    return [4 /*yield*/, Anomaly_1.Anomaly.deleteMany({})];
                case 2:
                    // Clear operational data
                    _a.sent();
                    return [4 /*yield*/, CapacityFactorRecord_1.CapacityFactorRecord.deleteMany({})];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, WeatherData_1.WeatherData.deleteMany({})];
                case 4:
                    _a.sent();
                    // Clear core entities
                    return [4 /*yield*/, SolarUnit_1.SolarUnit.deleteMany({})];
                case 5:
                    // Clear core entities
                    _a.sent();
                    // We intentionally DO NOT clear Users to preserve login state
                    console.log("Data cleared. Starting seed...");
                    return [4 /*yield*/, User_1.User.findOne({})];
                case 6:
                    user = _a.sent();
                    userId = null;
                    if (user) {
                        console.log("Found user: ".concat(user.firstName, " ").concat(user.lastName, " (").concat(user._id, ")"));
                        userId = user._id; // Pass objectId directly
                    }
                    else {
                        console.log("No existing user found. Unit will be unassigned.");
                    }
                    return [4 /*yield*/, SolarUnit_1.SolarUnit.create({
                            serialNumber: "SU-0001",
                            installationDate: new Date("2025-08-01"),
                            capacity: 5000,
                            status: "ACTIVE",
                            userId: userId,
                            location: {
                                latitude: 40.7128,
                                longitude: -74.0060
                            },
                            city: "New York",
                            country: "United States"
                        })];
                case 7:
                    solarUnit = _a.sent();
                    console.log("Database seeded successfully. Created solar unit: ".concat(solarUnit.serialNumber));
                    return [3 /*break*/, 11];
                case 8:
                    err_1 = _a.sent();
                    console.error("Seeding error:", err_1);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
seed();
//# sourceMappingURL=seed.js.map