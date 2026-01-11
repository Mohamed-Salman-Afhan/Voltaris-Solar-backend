import "dotenv/config";
import express from "express";
import energyGenerationRecordRouter from "./api/energy-generation-record";
import weatherRouter from "./api/weather";
import capacityFactorRouter from "./api/capacity-factor";
import { anomalyRouter } from "./api/anomalies";
import { globalErrorHandler } from "./api/middlewares/global-error-handling-middleware";
import { loggerMiddleware } from "./api/middlewares/logger-middleware";
import solarUnitRouter from "./api/solar-unit";
import { connectDB } from "./infrastructure/db";
import { initializeScheduler } from "./infrastructure/scheduler";
import cors from "cors";
import webhooksRouter from "./api/webhooks";
import { clerkMiddleware } from "@clerk/express";
import usersRouter from "./api/users";
import invoiceRouter from "./api/invoice";
import paymentRouter from "./api/payment";
import { handleStripeWebhook } from "./api/controllers/payment.controller";
import analyticsRouter from "./api/routes/analytics.routes";
import adminInvoiceRouter from "./api/routes/admin-invoice.routes";

const server = express();
server.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

// Health Check Endpoint
server.get("/health", (req, res) => {
    res.status(200).send("OK");
});

server.use(loggerMiddleware);

server.use("/api/webhooks", webhooksRouter);
server.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

server.use(clerkMiddleware());

server.use(express.json());

server.use("/api/solar-units", solarUnitRouter);
server.use("/api/energy-generation-records", energyGenerationRecordRouter);
server.use("/api/users", usersRouter);
server.use("/api/weather", weatherRouter);
server.use("/api/capacity-factor", capacityFactorRouter);
server.use("/api/anomalies", anomalyRouter);
server.use("/api/invoices", invoiceRouter);
server.use("/api/payments", paymentRouter);
server.use("/api/analytics", analyticsRouter);
server.use("/api/admin/invoices", adminInvoiceRouter);

server.use(globalErrorHandler);

connectDB();
initializeScheduler();

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
