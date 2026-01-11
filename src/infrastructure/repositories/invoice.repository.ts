import { Invoice } from "../entities/Invoice";
import { User } from "../entities/User";

export class InvoiceRepository {
    async findByUserId(userId: string) {
        return Invoice.find({ userId })
            .sort({ createdAt: -1 })
            .populate("solarUnitId", "serialNumber name status");
    }

    async findById(id: string) {
        return Invoice.findById(id).populate(
            "solarUnitId",
            "serialNumber name location"
        );
    }

    async updatePaymentStatus(id: string, status: "PAID" | "PENDING" | "OVERDUE") {
        return Invoice.findByIdAndUpdate(
            id,
            {
                paymentStatus: status,
                paidAt: status === "PAID" ? new Date() : undefined,
            },
            { new: true }
        );
    }

    // Helper to find internal user by Clerk ID, primarily for Service usage but can be in Reference Repo?
    // Or UserRepo. Let's keep it simple and assume Service calls UserRepo, but since I haven't made UserRepo,
    // I might just put it here or use User entity in Service (acceptable if User module isn't fully refactored yet).
    // Ideally I should also make UserRepository.
    // Let's make UserRepository quickly as well? It's better.
}
