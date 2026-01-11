import { ISolarUnit } from "../../infrastructure/entities/SolarUnit";
import { SolarUnitRepository } from "../../infrastructure/repositories/solar-unit.repository";
import { EnergyRecordRepository } from "../../infrastructure/repositories/energy-record.repository";
import { Invoice } from "../../infrastructure/entities/Invoice";
import { User } from "../../infrastructure/entities/User";
import { generateMonthlyInvoices } from "../background/generate-invoices";
import { NotFoundError } from "../../domain/errors/errors";

export class SolarUnitService {
    private solarRepo: SolarUnitRepository;
    private energyRepo: EnergyRecordRepository;

    constructor() {
        this.solarRepo = new SolarUnitRepository();
        this.energyRepo = new EnergyRecordRepository();
    }

    async getAll(query: any) {
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 10;
        const status = query.status as string;

        const skip = (page - 1) * limit;

        const filter: any = {};
        if (status && status !== "ALL") {
            filter.status = status;
        }

        const total = await this.solarRepo.count(filter);
        const units = await this.solarRepo.findAll(filter, skip, limit);

        return {
            units,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUnits: total
        };
    }

    async create(data: any): Promise<ISolarUnit> {
        const createdSolarUnit = await this.solarRepo.create({
            serialNumber: data.serialNumber,
            installationDate: new Date(data.installationDate).toISOString(),
            capacity: data.capacity,
            status: data.status,
            location: data.location,
            city: data.city,
            country: data.country,
            userId: data.userId // Assuming userId might be passed if created by admin with user? Original didn't seem to pass it in DTO explicitly but maybe?
            // Original: const newSolarUnit = { ...data.serialNumber ... } - it did NOT include userId in the variable `newSolarUnit` explicitly in the `createSolarUnit` function!
            // Wait, let's check `createSolarUnit` in original.
            // `const newSolarUnit = { serialNumber: data.serialNumber, ... }` -> It did NOT copy userId. Check DTO.
            // But `SolarUnitProvisioningService.provisionUnit` uses `createdSolarUnit.toObject()`.
            // If `userId` is not set, it's null.
        });

        // Provisioning
        try {
            const { SolarUnitProvisioningService } = await import("../provisioning.service");
            await SolarUnitProvisioningService.provisionUnit(createdSolarUnit.toObject());
        } catch (err) {
            console.error(`[Create] Provisioning failed for ${createdSolarUnit.serialNumber}:`, err);
        }

        return createdSolarUnit;
    }

    async getById(id: string) {
        const unit = await this.solarRepo.findById(id);
        if (!unit) throw new NotFoundError("Solar unit not found");
        return unit;
    }

    async getForUser(clerkUserId: string) {
        const user = await User.findOne({ clerkUserId });
        if (!user) throw new NotFoundError("User not found");
        return this.solarRepo.findByUserId(user._id.toString());
    }

    async update(id: string, data: any) {
        const solarUnit = await this.solarRepo.findById(id);
        if (!solarUnit) throw new NotFoundError("Solar unit not found");

        const oldOwnerId = solarUnit.userId?.toString();
        const newOwnerId = data.userId?.toString();
        const isOwnerChanging = newOwnerId && oldOwnerId !== newOwnerId;

        const updatedSolarUnit = await this.solarRepo.update(id, data);

        if (isOwnerChanging) {
            console.log(`[OwnershipTransfer] Transferring data for Unit ${id} from ${oldOwnerId} to ${newOwnerId}...`);

            // Transfer Invoices
            await Invoice.updateMany(
                { solarUnitId: id },
                { $set: { userId: newOwnerId } }
            );

            // Transfer Energy Records
            await this.energyRepo.updateOwner(id, newOwnerId);
        }

        // Trigger Billing if user assigned
        if (newOwnerId && (oldOwnerId !== newOwnerId)) {
            console.log(`[Update] User assigned to Unit ${id}. Triggering retrospective billing...`);
            // Fire and forget catch
            generateMonthlyInvoices(id)
                .then(count => {
                    if (count > 0) console.log(`[Update] Generated ${count} invoices for newly assigned unit.`);
                })
                .catch(err => console.error("[Update] Billing trigger failed:", err));
        }

        return updatedSolarUnit;
    }

    async delete(id: string) {
        const unit = await this.solarRepo.findById(id);
        if (!unit) throw new NotFoundError("Solar unit not found");
        await this.solarRepo.delete(id);
    }
}
