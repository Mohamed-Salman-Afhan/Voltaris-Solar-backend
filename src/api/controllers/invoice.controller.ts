
import { NextFunction, Request, Response } from "express";
import { InvoiceService } from "../../application/services/invoice.service";
import { getAuth } from "@clerk/express";

const invoiceService = new InvoiceService();

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = getAuth(req);
        const userId = auth.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const invoices = await invoiceService.getInvoicesForUser(userId);
        res.json(invoices);
    } catch (error) {
        next(error);
    }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id);
        res.json(invoice);
    } catch (error) {
        next(error);
    }
};
