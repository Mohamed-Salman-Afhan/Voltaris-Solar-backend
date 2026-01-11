import { EnergyRecordRepository } from "../../infrastructure/repositories/energy-record.repository";

export class EnergyService {
    private repository: EnergyRecordRepository;

    constructor() {
        this.repository = new EnergyRecordRepository();
    }

    async getEnergyStats(solarUnitId: string, options: { groupBy?: string; limit?: string }) {
        const { groupBy, limit } = options;
        const limitNum = limit ? parseInt(limit) : 7;

        if (!groupBy) {
            // Original logic did not apply limit to simple fetch
            return this.repository.findBySolarUnitIdSimple(solarUnitId);
        }

        if (groupBy === "date" || groupBy === "hour" || groupBy === "weekly") {
            return this.repository.getAggregatedStats(solarUnitId, groupBy, limitNum);
        }

        throw new Error(`Invalid groupBy parameter: ${groupBy}`);
    }
}
