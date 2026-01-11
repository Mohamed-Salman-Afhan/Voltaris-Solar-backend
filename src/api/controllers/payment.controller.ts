import { NextFunction, Request, Response } from "express";
import { PaymentService } from "../../application/services/payment.service";

const paymentService = new PaymentService();

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { invoiceId } = req.body;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const result = await paymentService.createCheckoutSession(invoiceId, frontendUrl);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getSessionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { session_id } = req.query;
        if (typeof session_id !== "string") {
            return res.status(400).json({ message: "Invalid session_id" });
        }
        const result = await paymentService.getSessionStatus(session_id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
    try {
        const sig = req.headers["stripe-signature"] as string;
        await paymentService.handleWebhook(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        res.status(200).json({ received: true });
    } catch (error: any) {
        res.status(400).send(error.message);
    }
};
