"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = __importDefault(require("express"));
var energy_generation_record_1 = __importDefault(require("./api/energy-generation-record"));
var weather_1 = __importDefault(require("./api/weather"));
var capacity_factor_1 = __importDefault(require("./api/capacity-factor"));
var anomalies_1 = require("./api/anomalies");
var global_error_handling_middleware_1 = require("./api/middlewares/global-error-handling-middleware");
var logger_middleware_1 = require("./api/middlewares/logger-middleware");
var solar_unit_1 = __importDefault(require("./api/solar-unit"));
var db_1 = require("./infrastructure/db");
var scheduler_1 = require("./infrastructure/scheduler");
var cors_1 = __importDefault(require("cors"));
var webhooks_1 = __importDefault(require("./api/webhooks"));
var express_2 = require("@clerk/express");
var users_1 = __importDefault(require("./api/users"));
var invoice_1 = __importDefault(require("./api/invoice"));
var payment_1 = __importDefault(require("./api/payment"));
var payment_2 = require("./application/payment");
var analytics_routes_1 = __importDefault(require("./api/routes/analytics.routes"));
var admin_invoice_routes_1 = __importDefault(require("./api/routes/admin-invoice.routes"));
var server = (0, express_1.default)();
server.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
// Health Check Endpoint
server.get("/health", function (req, res) {
    res.status(200).send("OK");
});
server.use(logger_middleware_1.loggerMiddleware);
server.use("/api/webhooks", webhooks_1.default);
server.post("/api/stripe/webhook", express_1.default.raw({ type: "application/json" }), payment_2.handleStripeWebhook);
server.use((0, express_2.clerkMiddleware)());
server.use(express_1.default.json());
server.use("/api/solar-units", solar_unit_1.default);
server.use("/api/energy-generation-records", energy_generation_record_1.default);
server.use("/api/users", users_1.default);
server.use("/api/weather", weather_1.default);
server.use("/api/capacity-factor", capacity_factor_1.default);
server.use("/api/anomalies", anomalies_1.anomalyRouter);
server.use("/api/invoices", invoice_1.default);
server.use("/api/payments", payment_1.default);
server.use("/api/analytics", analytics_routes_1.default);
server.use("/api/admin/invoices", admin_invoice_routes_1.default);
server.use(global_error_handling_middleware_1.globalErrorHandler);
(0, db_1.connectDB)();
(0, scheduler_1.initializeScheduler)();
var PORT = process.env.PORT || 8000;
server.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
//# sourceMappingURL=index.js.map