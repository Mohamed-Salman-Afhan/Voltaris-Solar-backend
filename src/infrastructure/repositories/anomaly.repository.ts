import { Anomaly, IAnomaly } from "../entities/Anomaly";

export class AnomalyRepository {
    async findOne(query: any): Promise<IAnomaly | null> {
        return Anomaly.findOne(query);
    }

    async create(data: any): Promise<IAnomaly> {
        return Anomaly.create(data) as any as Promise<IAnomaly>;
    }
}
