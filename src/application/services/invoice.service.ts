import { InvoiceRepository } from "../../infrastructure/repositories/invoice.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { NotFoundError } from "../../domain/errors/errors";

export class InvoiceService {
    private invoiceRepo: InvoiceRepository;
    private userRepo: UserRepository;

    constructor() {
        this.invoiceRepo = new InvoiceRepository();
        this.userRepo = new UserRepository();
    }

    async getInvoicesForUser(clerkUserId: string) {
        const user = await this.userRepo.findByClerkId(clerkUserId);
        if (!user) {
            console.log(`[InvoiceService] User not found for clerkUserId: ${clerkUserId}`);
            // Returning empty array as per original logic, or throw NotFound?
            // Original logic returned empty array with log.
            return [];
        }

        return this.invoiceRepo.findByUserId(user._id.toString());
    }

    async getInvoiceById(id: string) {
        const invoice = await this.invoiceRepo.findById(id);
        if (!invoice) {
            throw new NotFoundError("Invoice not found");
        }
        return invoice;
    }
}
