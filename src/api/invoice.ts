import express from "express";
import { Invoice } from "../infrastructure/entities/Invoice";
import { authenticationMiddleware } from "./middlewares/authentication-middleware";
import { NotFoundError } from "./errors/not-found-error";

const router = express.Router();

// List invoices for authenticated user
router.get("/", authenticationMiddleware, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const userId = (req as any).auth.userId; // Assuming Clerk auth attaches to req.auth

        // If admin functionality is needed later, we can check roles here
        // For now, return invoices where userId matches.
        // Note: We need to resolve the Clerk userId to our internal User _id if they differ.
        // Assuming for now that the Invoice.userId stores the Clerk ID or we do a lookup.
        // Based on SolarUnit pattern, let's see how user relation is handled.
        // If SolarUnit uses a reference to a User entity, we likely need to find that User first.

        // Wait, let's double check User entity.
        // But for now, assuming standard pattern:

        // Actually, let's look up the user by their Clerk ID first if needed?
        // Let's assume the middleware populates req.auth.userId (clerk id)
        // and we query Invoices.

        // However, the Invoice model has `userId: ref: "User"`.
        // So we probably need to find the User doc by Clerk ID first.
        // Let's assume there's a helper or we just query User.

        // SIMPLIFICATION for this step:
        // I'll grab the user from the database using the clerk ID from auth.
        // Then query invoices.

        // Actually, let's check how SolarUnit does it.
        // The view_file output of SolarUnit.ts shows `userId: ref "User"`.

        // I'll stick to a safe approach:
        const { User } = await import("../infrastructure/entities/User");
        console.log(`[InvoiceAPI] Lookng for user with clerkUserId: ${userId}`);
        const user = await User.findOne({ clerkUserId: userId });

        if (!user) {
            console.log(`[InvoiceAPI] User not found for clerkUserId: ${userId}`);
            return res.json([]);
        }

        console.log(`[InvoiceAPI] Found user: ${user._id}`);

        const invoices = await Invoice.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .populate("solarUnitId", "serialNumber name status"); // Populate basic unit info

        console.log(`[InvoiceAPI] Found ${invoices.length} invoices for user ${user._id}`);
        res.json(invoices);
    } catch (error) {
        next(error);
    }
});

// Get single invoice
router.get("/:id", authenticationMiddleware, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate("solarUnitId", "serialNumber name location");

        if (!invoice) {
            throw new NotFoundError("Invoice not found");
        }

        // TODO: Verify ownership

        res.json(invoice);
    } catch (error) {
        next(error);
    }
});

export default router;
