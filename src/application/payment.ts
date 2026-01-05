import Stripe from "stripe";
import { Request, Response } from "express";
import { Invoice } from "../infrastructure/entities/Invoice";
import { NotFoundError } from "../api/errors/not-found-error";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover', // Use latest or pinned version
});

export const createCheckoutSession = async (req: Request, res: Response, next: any) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            throw new NotFoundError("Invoice not found");
        }

        if (invoice.paymentStatus === "PAID") {
            return res.status(400).json({ message: "Invoice already paid" });
        }

        const session = await stripe.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: Math.round(invoice.totalEnergyGenerated),
                },
            ],
            mode: "payment",
            return_url: `${process.env.FRONTEND_URL}/dashboard/invoices/complete?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                invoiceId: invoice._id.toString(),
            },
            automatic_tax: { enabled: false } // Disable if not configured
        });

        res.json({ clientSecret: session.client_secret });
    } catch (error: any) {
        console.error("Error creating checkout session:", error.message, error);
        next(error);
    }
};

export const getSessionStatus = async (req: Request, res: Response, next: any) => {
    try {
        const { session_id } = req.query;

        if (!session_id || typeof session_id !== 'string') {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        res.json({
            status: session.status,
            paymentStatus: session.payment_status,
            amountTotal: session.amount_total,
        });
    } catch (error) {
        next(error);
    }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId;

        if (invoiceId && session.payment_status === "paid") {
            try {
                await Invoice.findByIdAndUpdate(invoiceId, {
                    paymentStatus: "PAID",
                    paidAt: new Date(),
                });
                console.log("Invoice marked as PAID:", invoiceId);
            } catch (err) {
                console.error("Error updating invoice status:", err);
            }
        }
    }

    res.status(200).json({ received: true });
};
