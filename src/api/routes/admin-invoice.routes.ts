import express from "express";
import { getAdminInvoices } from "../controllers/admin-invoice.controller";
import { authenticationMiddleware } from "../middlewares/authentication-middleware";
import { authorizationMiddleware } from "../middlewares/authorization-middleware"; // Assuming admin check is here

const adminInvoiceRouter = express.Router();

adminInvoiceRouter.get("/", authenticationMiddleware, authorizationMiddleware, getAdminInvoices);

export default adminInvoiceRouter;
