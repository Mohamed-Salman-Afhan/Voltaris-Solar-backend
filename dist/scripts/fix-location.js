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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv = __importStar(require("dotenv"));
var path_1 = __importDefault(require("path"));
var SolarUnit_1 = require("../infrastructure/entities/SolarUnit");
// Explicitly load .env from project root
dotenv.config({ path: path_1.default.resolve(__dirname, "../../.env") });
var updateLocation = function () { return __awaiter(void 0, void 0, void 0, function () {
    var uri, unitId, unit, anyUnit, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 11]);
                uri = process.env.MONGODB_URL;
                if (!uri) {
                    throw new Error("MONGODB_URL not found in environment variables");
                }
                return [4 /*yield*/, mongoose_1.default.connect(uri)];
            case 1:
                _a.sent();
                console.log("Connected to DB");
                unitId = "695a14c81eb689e61e5a711c";
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findById(unitId)];
            case 2:
                unit = _a.sent();
                if (!!unit) return [3 /*break*/, 7];
                console.log("Unit ".concat(unitId, " not found. Searching for ANY unit..."));
                return [4 /*yield*/, SolarUnit_1.SolarUnit.findOne()];
            case 3:
                anyUnit = _a.sent();
                if (!anyUnit) return [3 /*break*/, 5];
                console.log("Found unit ".concat(anyUnit._id, ". Updating..."));
                anyUnit.location = {
                    latitude: 40.7128,
                    longitude: -74.0060
                };
                return [4 /*yield*/, anyUnit.save()];
            case 4:
                _a.sent();
                console.log("Location updated successfully.");
                return [3 /*break*/, 6];
            case 5:
                console.log("No solar units found in database.");
                _a.label = 6;
            case 6: return [3 /*break*/, 9];
            case 7:
                unit.location = {
                    latitude: 40.7128,
                    longitude: -74.0060
                };
                return [4 /*yield*/, unit.save()];
            case 8:
                _a.sent();
                console.log("Updated location for unit ".concat(unitId));
                _a.label = 9;
            case 9:
                process.exit(0);
                return [3 /*break*/, 11];
            case 10:
                error_1 = _a.sent();
                console.error("Error updating location:", error_1);
                process.exit(1);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
updateLocation();
//# sourceMappingURL=fix-location.js.map