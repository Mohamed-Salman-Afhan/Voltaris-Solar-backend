import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import { EnergyGenerationRecord } from "../infrastructure/entities/EnergyGenerationRecord";
import { AnomalyDetectionService } from "./services/anomaly.service";
import { syncEnergyGenerationRecords } from "./background/sync-energy-generation-records";
import { generateMonthlyInvoices } from "./background/generate-invoices";
import { EnergySimulationService } from "./services/energy-simulation.service";
import { addHours } from "date-fns";

export class SolarUnitProvisioningService {

    /**
     * Orchestrates the full lifecycle of a new Solar Unit:
     * 1. Seed History (Data API)
     * 2. Sync Records (Data API -> Local DB)
     * 3. Anomaly Detection
     * 4. Retrospective Billing
     */
    static async provisionUnit(solarUnit: any): Promise<void> {
        console.log(`[Provisioning] Starting pipeline for ${solarUnit.serialNumber}...`);

        // Step 1: Seed History
        await this.triggerSeedHistory(solarUnit);

        // Step 2: Sync Data (with verification)
        await this.syncWithRetry(solarUnit);

        // Step 3: Anomaly Detection
        const historyRecords = await EnergyGenerationRecord.find({ solarUnitId: solarUnit._id });
        if (historyRecords.length > 0) {
            console.log(`[Provisioning] Analyzing ${historyRecords.length} records...`);
            const anomalyService = new AnomalyDetectionService();
            await anomalyService.analyzeRecords(historyRecords);
        } else {
            console.warn(`[Provisioning] No records found after sync for ${solarUnit.serialNumber}. Skipping analysis.`);
        }

        // Step 4: Billing
        await this.billingWithRetry(solarUnit._id.toString());

        console.log(`[Provisioning] Pipeline complete for ${solarUnit.serialNumber}.`);
    }

    private static async triggerSeedHistory(solarUnit: any) {
        const DATA_API_URL = process.env.DATA_API_URL || "http://localhost:8001";
        try {
            console.log(`[Provisioning] Seeding history...`);
            const response = await fetch(`${DATA_API_URL}/api/energy-generation-records/seed-history`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Voltaris-Solar-Backend/1.0",
                    "Referer": "https://voltaris-solar-dashboard.onrender.com/"
                },
                body: JSON.stringify(solarUnit)
            });

            if (!response.ok) {
                console.warn(`[Provisioning] Seed API blocked (${response.status}). Switching to INTERNAL SEEDING.`);
                await this.seedHistoryLocally(solarUnit);
            }
        } catch (err) {
            console.warn(`[Provisioning] Seed API unreachable. Switching to INTERNAL SEEDING. Error: ${err}`);
            await this.seedHistoryLocally(solarUnit);
        }
    }

    private static async seedHistoryLocally(solarUnit: any) {
        console.log(`[Provisioning] Generating 30 days of history locally for ${solarUnit.serialNumber}...`);
        try {
            const endDate = new Date();
            // Start from installation date or 30 days ago
            let currentDate = solarUnit.installationDate ? new Date(solarUnit.installationDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const records: any[] = [];

            while (currentDate <= endDate) {
                const energy = EnergySimulationService.calculateEnergyGeneration(currentDate);
                records.push({
                    solarUnitId: solarUnit._id,
                    energyGenerated: energy,
                    timestamp: new Date(currentDate),
                    intervalHours: 2
                });
                currentDate = addHours(currentDate, 2);
            }

            if (records.length > 0) {
                await EnergyGenerationRecord.insertMany(records, { ordered: false });
                console.log(`[Provisioning] Internally generated ${records.length} records.`);
            }
        } catch (e) {
            console.error("[Provisioning] Internal Seeding Failed:", e);
            throw e; // If even local fails, then we really fail
        }
    }

    private static async syncWithRetry(solarUnit: any) {
        let recordsFound = false;
        const MAX_RETRIES = 5;

        for (let i = 0; i < MAX_RETRIES; i++) {
            await syncEnergyGenerationRecords(solarUnit._id.toString());
            const count = await EnergyGenerationRecord.countDocuments({ solarUnitId: solarUnit._id });
            if (count > 0) {
                console.log(`[Provisioning] Verified ${count} records synced.`);
                recordsFound = true;
                break;
            }
            console.log(`[Provisioning] No records yet. Retrying sync (${i + 1}/${MAX_RETRIES})...`);
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!recordsFound) console.warn("[Provisioning] Data sync verification failed. Proceeding anyway.");
    }

    private static async billingWithRetry(unitId: string) {
        const MAX_RETRIES = 5;
        for (let i = 0; i < MAX_RETRIES; i++) {
            const count = await generateMonthlyInvoices(unitId);
            if (count > 0) {
                console.log(`[Provisioning] Created ${count} invoices.`);
                return;
            }
            console.log(`[Provisioning] No invoices generated. Retrying billing (${i + 1}/${MAX_RETRIES})...`);
            await new Promise(r => setTimeout(r, 2000));
        }
        console.warn("[Provisioning] Billing retry exhausted. No invoices created.");
    }
}
