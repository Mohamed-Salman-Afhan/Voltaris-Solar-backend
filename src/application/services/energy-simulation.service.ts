
/**
 * Energy Simulation Service
 * 
 * This service contains the "Business Logic" for simulating solar energy generation.
 * Originally hosted in the Data API, it is now internalized to allow
 * offline/local generation when the Data API is rate-limited or unreachable.
 */

export class EnergySimulationService {

    /**
     * Calculate realistic energy generation based on timestamp
     * Uses seasonal variations and time-of-day multipliers
     * Ported from Data API (src/infrastructure/energy-generation-cron.ts)
     */
    static calculateEnergyGeneration(timestamp: Date): number {
        const hour = timestamp.getUTCHours();
        const month = timestamp.getUTCMonth(); // 0-11

        // Base energy generation (higher in summer months)
        let baseEnergy = 200;
        if (month >= 5 && month <= 7) {
            // June-August (summer)
            baseEnergy = 300;
        } else if (month >= 2 && month <= 4) {
            // March-May (spring)
            baseEnergy = 250;
        } else if (month >= 8 && month <= 10) {
            // September-November (fall)
            baseEnergy = 200;
        } else {
            // December-February (winter)
            baseEnergy = 150;
        }

        // Adjust based on time of day (solar panels generate more during daylight)
        let timeMultiplier = 1;
        if (hour >= 6 && hour <= 18) {
            // Daylight hours
            timeMultiplier = 1.2;
            if (hour >= 10 && hour <= 14) {
                // Peak sun hours
                timeMultiplier = 1.5;
            }
        } else {
            // Night hours
            timeMultiplier = 0;
        }

        // CHAOS MODE: 5% chance of anomaly
        // We use a deterministic-ish seeded random if possible, but Math.random is fine for simulation
        const chaosRoll = Math.random();

        if (chaosRoll < 0.01) {
            // 1% Chance: ZERO_GENERATION (Critical) during peak hours
            if (hour >= 10 && hour <= 14) return 0;
        }

        if (chaosRoll < 0.03) {
            // 2% Chance: SUDDEN_DROP (Warning) - 30% of expected output
            return Math.round(baseEnergy * timeMultiplier * 0.3);
        }

        if (chaosRoll < 0.04) {
            // 1% Chance: ERRATIC_FLUCTUATION (Warning) - 300% spike
            return Math.round(baseEnergy * timeMultiplier * 3.0);
        }

        // Add some random variation (±20%)
        const variation = 0.8 + Math.random() * 0.4;
        const energyGenerated = Math.round(baseEnergy * timeMultiplier * variation);

        return energyGenerated;
    }
}
