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
var express_1 = __importDefault(require("express"));
var webhooks_1 = require("@clerk/express/webhooks");
var User_1 = require("../infrastructure/entities/User");
var webhooksRouter = express_1.default.Router();
webhooksRouter.post("/clerk", express_1.default.raw({ type: "application/json" }), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var evt, id, eventType, id_1, user, id_2, user, id_3, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                return [4 /*yield*/, (0, webhooks_1.verifyWebhook)(req)];
            case 1:
                evt = _a.sent();
                id = evt.data.id;
                eventType = evt.type;
                console.log("Received webhook with ID ".concat(id, " and event type of ").concat(eventType));
                console.log("Webhook payload:", evt.data);
                if (!(eventType === "user.created")) return [3 /*break*/, 4];
                id_1 = evt.data.id;
                return [4 /*yield*/, User_1.User.findOne({ clerkUserId: id_1 })];
            case 2:
                user = _a.sent();
                if (user) {
                    console.log("User already exists");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, User_1.User.create({
                        firstName: evt.data.first_name,
                        lastName: evt.data.last_name,
                        email: evt.data.email_addresses[0].email_address,
                        clerkUserId: id_1,
                        imageUrl: evt.data.image_url,
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                if (!(eventType === "user.updated")) return [3 /*break*/, 6];
                id_2 = evt.data.id;
                return [4 /*yield*/, User_1.User.findOneAndUpdate({ clerkUserId: id_2 }, {
                        role: evt.data.public_metadata.role,
                    })];
            case 5:
                user = _a.sent();
                _a.label = 6;
            case 6:
                if (!(eventType === "user.deleted")) return [3 /*break*/, 8];
                id_3 = evt.data.id;
                return [4 /*yield*/, User_1.User.findOneAndDelete({ clerkUserId: id_3 })];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8: return [2 /*return*/, res.send("Webhook received")];
            case 9:
                err_1 = _a.sent();
                console.error("Error verifying webhook:", err_1);
                return [2 /*return*/, res.status(400).send("Error verifying webhook")];
            case 10: return [2 /*return*/];
        }
    });
}); });
exports.default = webhooksRouter;
//# sourceMappingURL=webhooks.js.map