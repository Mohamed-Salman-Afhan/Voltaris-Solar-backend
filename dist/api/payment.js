"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var payment_1 = require("../application/payment");
var authentication_middleware_1 = require("./middlewares/authentication-middleware");
var router = express_1.default.Router();
router.post("/create-checkout-session", authentication_middleware_1.authenticationMiddleware, payment_1.createCheckoutSession);
router.get("/session-status", authentication_middleware_1.authenticationMiddleware, payment_1.getSessionStatus);
exports.default = router;
//# sourceMappingURL=payment.js.map