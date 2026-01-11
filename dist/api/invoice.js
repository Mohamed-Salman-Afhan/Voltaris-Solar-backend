"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var invoice_controller_1 = require("./controllers/invoice.controller");
var authentication_middleware_1 = require("./middlewares/authentication-middleware");
var router = express_1.default.Router();
// List invoices for authenticated user
router.get("/", authentication_middleware_1.authenticationMiddleware, invoice_controller_1.getInvoices);
// Get single invoice
router.get("/:id", authentication_middleware_1.authenticationMiddleware, invoice_controller_1.getInvoiceById);
exports.default = router;
//# sourceMappingURL=invoice.js.map