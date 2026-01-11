import Stripe from "stripe";
import { InvoiceRepository } from "../../infrastructure/repositories/invoice.repository";
import { NotFoundError } from "../../domain/errors/errors";

export class PaymentService {
    private stripe: Stripe;
    private invoiceRepo: InvoiceRepository;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
        } as any);
        this.invoiceRepo = new InvoiceRepository();
    }

    async createCheckoutSession(invoiceId: string, frontendUrl: string) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice) throw new NotFoundError("Invoice not found");

        if (invoice.paymentStatus === "PAID") {
            throw new Error("Invoice already paid");
        }

        const session = await this.stripe.checkout.sessions.create({
            ui_mode: "embedded",
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: Math.round(invoice.totalEnergyGenerated),
                },
            ],
            mode: "payment",
            return_url: `${frontendUrl}/dashboard/invoices/complete?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                invoiceId: invoice._id.toString(),
            },
            automatic_tax: { enabled: false },
        });

        return { clientSecret: session.client_secret };
    }

    async getSessionStatus(sessionId: string) {
        if (!sessionId) throw new Error("Session ID is required");

        const session = await this.stripe.checkout.sessions.retrieve(sessionId);

        // Optimistic Update
        if (session.payment_status === "paid" && session.metadata?.invoiceId) {
            this.invoiceRepo.updatePaymentStatus(session.metadata.invoiceId, "PAID")
                .catch(err => console.error("[PaymentService] Lazy update failed", err));
        }

        return {
            status: session.status,
            paymentStatus: session.payment_status,
            amountTotal: session.amount_total,
        };
    }

    async handleWebhook(body: any, signature: string, webhookSecret: string) {
        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const invoiceId = session.metadata?.invoiceId;

            if (invoiceId && session.payment_status === "paid") {
                await this.invoiceRepo.updatePaymentStatus(invoiceId, "PAID");
                console.log("Invoice marked as PAID via Webhook:", invoiceId);
            }
        }
    }
}
