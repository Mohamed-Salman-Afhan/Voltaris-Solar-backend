import express from "express";
import { getInvoices, getInvoiceById } from "./controllers/invoice.controller";
import { authenticationMiddleware } from "./middlewares/authentication-middleware";

const router = express.Router();

// List invoices for authenticated user
router.get("/", authenticationMiddleware, getInvoices);

// Get single invoice
router.get("/:id", authenticationMiddleware, getInvoiceById);

export default router;
