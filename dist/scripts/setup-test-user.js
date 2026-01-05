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
var db_1 = require("../infrastructure/db");
var User_1 = require("../infrastructure/entities/User");
var SolarUnit_1 = require("../infrastructure/entities/SolarUnit");
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var user, units, _i, units_1, u, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, db_1.connectDB)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, User_1.User.findOne({})];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        console.log("No user found. Please sign up in the app first.");
                        process.exit(1);
                    }
                    console.log("Found user: ".concat(user.firstName, " ").concat(user.lastName, " (").concat(user.email, ")"));
                    if (!!user.imageUrl) return [3 /*break*/, 4];
                    // Sample image to demonstrate UI
                    user.imageUrl = "https://api.dicebear.com/9.x/avataaars/svg?seed=Emma";
                    return [4 /*yield*/, user.save()];
                case 3:
                    _a.sent();
                    console.log("Updated user with sample image URL.");
                    _a.label = 4;
                case 4:
                    units = [
                        { serial: "SU-0002", status: "ACTIVE" },
                        { serial: "SU-0003", status: "MAINTENANCE" },
                    ];
                    _i = 0, units_1 = units;
                    _a.label = 5;
                case 5:
                    if (!(_i < units_1.length)) return [3 /*break*/, 11];
                    u = units_1[_i];
                    return [4 /*yield*/, SolarUnit_1.SolarUnit.findOne({ serialNumber: u.serial })];
                case 6:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 8];
                    // Update ownership to this user just in case
                    existing.userId = user._id;
                    return [4 /*yield*/, existing.save()];
                case 7:
                    _a.sent();
                    console.log("Unit ".concat(u.serial, " already exists. Assigned to user."));
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, SolarUnit_1.SolarUnit.create({
                        serialNumber: u.serial,
                        userId: user._id,
                        status: u.status,
                        capacity: 5000,
                        installationDate: new Date(),
                        location: { latitude: 0, longitude: 0 }
                    })];
                case 9:
                    _a.sent();
                    console.log("Created unit ".concat(u.serial, " for user."));
                    _a.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 5];
                case 11:
                    console.log("Setup complete.");
                    return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 12:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
run();
//# sourceMappingURL=setup-test-user.js.map