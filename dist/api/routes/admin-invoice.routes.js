"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var admin_invoice_controller_1 = require("../controllers/admin-invoice.controller");
var authentication_middleware_1 = require("../middlewares/authentication-middleware");
var authorization_middleware_1 = require("../middlewares/authorization-middleware"); // Assuming admin check is here
var adminInvoiceRouter = express_1.default.Router();
adminInvoiceRouter.get("/", authentication_middleware_1.authenticationMiddleware, authorization_middleware_1.authorizationMiddleware, admin_invoice_controller_1.getAdminInvoices);
exports.default = adminInvoiceRouter;
//# sourceMappingURL=admin-invoice.routes.js.map