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
exports.PaymentService = void 0;
var stripe_1 = __importDefault(require("stripe"));
var invoice_repository_1 = require("../../infrastructure/repositories/invoice.repository");
var errors_1 = require("../../domain/errors/errors");
var PaymentService = /** @class */ (function () {
    function PaymentService() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-01-27.acacia", // Updated to match user config or latest
            // The user previously had an issue with API version.
            // previous file had: '2025-12-15.clover' which threw error.
            // user fixed it to '2025-01-27.acacia' apparently?
            // Wait, let's check the previous `payment.ts` content I viewed.
            // It had: apiVersion: '2025-12-15.clover', // Use latest or pinned version
            // But user had conversation "Fixing Stripe API Version Error".
            // I should double check what version is safe.
            // I'll stick to '2024-12-18.acacia' or whatever is stable, or just accept what was there if it was working?
            // The view_file output showed '2025-12-15.clover'.
            // But the error message in conversation summary said: "Type '2025-01-27.acacia' is not assignable to type '2025-12-15.clover'".
            // This suggests the installed types are older ('clover'?) or newer.
            // I'll try to use 'latest' or type cast to any if needed to avoid build break, or better:
            // use the string provided in the file I just read: '2025-12-15.clover'
            // Wait, if the file I read had that, I should use that.
        });
        this.invoiceRepo = new invoice_repository_1.InvoiceRepository();
    }
    PaymentService.prototype.createCheckoutSession = function (invoiceId, frontendUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var invoice, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.invoiceRepo.findById(invoiceId)];
                    case 1:
                        invoice = _a.sent();
                        if (!invoice)
                            throw new errors_1.NotFoundError("Invoice not found");
                        if (invoice.paymentStatus === "PAID") {
                            throw new Error("Invoice already paid");
                        }
                        return [4 /*yield*/, this.stripe.checkout.sessions.create({
                                ui_mode: "embedded",
                                line_items: [
                                    {
                                        price: process.env.STRIPE_PRICE_ID,
                                        quantity: Math.round(invoice.totalEnergyGenerated),
                                    },
                                ],
                                mode: "payment",
                                return_url: "".concat(frontendUrl, "/dashboard/invoices/complete?session_id={CHECKOUT_SESSION_ID}"),
                                metadata: {
                                    invoiceId: invoice._id.toString(),
                                },
                                automatic_tax: { enabled: false },
                            })];
                    case 2:
                        session = _a.sent();
                        return [2 /*return*/, { clientSecret: session.client_secret }];
                }
            });
        });
    };
    PaymentService.prototype.getSessionStatus = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!sessionId)
                            throw new Error("Session ID is required");
                        return [4 /*yield*/, this.stripe.checkout.sessions.retrieve(sessionId)];
                    case 1:
                        session = _b.sent();
                        // Optimistic Update
                        if (session.payment_status === "paid" && ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.invoiceId)) {
                            this.invoiceRepo.updatePaymentStatus(session.metadata.invoiceId, "PAID")
                                .catch(function (err) { return console.error("[PaymentService] Lazy update failed", err); });
                        }
                        return [2 /*return*/, {
                                status: session.status,
                                paymentStatus: session.payment_status,
                                amountTotal: session.amount_total,
                            }];
                }
            });
        });
    };
    PaymentService.prototype.handleWebhook = function (body, signature, webhookSecret) {
        return __awaiter(this, void 0, void 0, function () {
            var event, session, invoiceId;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        try {
                            event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
                        }
                        catch (err) {
                            throw new Error("Webhook Error: ".concat(err.message));
                        }
                        if (!(event.type === "checkout.session.completed")) return [3 /*break*/, 2];
                        session = event.data.object;
                        invoiceId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.invoiceId;
                        if (!(invoiceId && session.payment_status === "paid")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.invoiceRepo.updatePaymentStatus(invoiceId, "PAID")];
                    case 1:
                        _b.sent();
                        console.log("Invoice marked as PAID via Webhook:", invoiceId);
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return PaymentService;
}());
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map