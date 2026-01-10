import { SolarUnit } from "../infrastructure/entities/SolarUnit";
import { WeatherData } from "../infrastructure/entities/WeatherData";
import { NotFoundError } from "../api/errors/not-found-error";

interface WeatherResponse {
    temperature: number;
    cloudcover: number;
    windspeed: number;
    shortwave_radiation: number;
    impact_level: "Optimal" | "Degraded" | "Poor";
    timestamp: Date;
    city?: string;
    country?: string;
}

export const getWeatherForUnit = async (
    solarUnitId: string
): Promise<WeatherResponse> => {
    const solarUnit = await SolarUnit.findById(solarUnitId);
    if (!solarUnit) {
        throw new NotFoundError("Solar Unit not found");
    }

    // Check if location is configured
    if (
        !solarUnit.location ||
        solarUnit.location.latitude === undefined ||
        solarUnit.location.longitude === undefined
    ) {
        throw new Error("Solar unit location not configured");
    }

    // Check for cached data (fresh within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const cachedWeather = await WeatherData.findOne({
        solar_unit_id: solarUnitId,
        timestamp: { $gte: tenMinutesAgo },
    }).sort({ timestamp: -1 });

    if (cachedWeather) {
        return {
            temperature: cachedWeather.temperature!,
            cloudcover: cachedWeather.cloudcover!,
            windspeed: cachedWeather.windspeed!,
            shortwave_radiation: cachedWeather.shortwave_radiation!,
            impact_level: cachedWeather.impact_level as "Optimal" | "Degraded" | "Poor",
            timestamp: cachedWeather.timestamp,
            city: (solarUnit as any).city,
            country: (solarUnit as any).country,
        };
    }

    // Fetch from Open-Meteo
    // https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m,cloud_cover,shortwave_radiation
    const { latitude, longitude } = solarUnit.location;
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,cloud_cover,wind_speed_10m,shortwave_radiation`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Open-Meteo API error: ${response.statusText}`);
        }
        const data = await response.json() as any;
        const current = data.current;

        const temp = current.temperature_2m;
        const clouds = current.cloud_cover;
        const wind = current.wind_speed_10m;
        const radiation = current.shortwave_radiation || 0; // Sometimes null at night

        // Calculate Impact
        let impact: "Optimal" | "Degraded" | "Poor" = "Optimal";

        if (clouds > 60 || radiation < 200) {
            // Adjusted radiation threshold for "Poor" slightly lower for night time handling? 
            // SRS says: Poor: Cloud > 60 OR Radiation < 500. 
            // Note: At night radiation is 0, so it will always be Poor? 
            // That makes sense for solar production.
            impact = "Poor";
        } else if (clouds >= 20 || radiation <= 800) {
            impact = "Degraded";
        } else {
            impact = "Optimal";
        }

        // Save to DB
        const newWeather = await WeatherData.create({
            solar_unit_id: solarUnitId,
            location: { latitude, longitude },
            timestamp: new Date(), // Use current time or api time? API returns time. Let's use current server time for simplicity of expiration.
            temperature: temp,
            cloudcover: clouds,
            windspeed: wind,
            shortwave_radiation: radiation,
            impact_level: impact,
        });

        return {
            temperature: newWeather.temperature!,
            cloudcover: newWeather.cloudcover!,
            windspeed: newWeather.windspeed!,
            shortwave_radiation: newWeather.shortwave_radiation!,
            impact_level: newWeather.impact_level as "Optimal" | "Degraded" | "Poor",
            timestamp: newWeather.timestamp,
            city: (solarUnit as any).city,
            country: (solarUnit as any).country,
        };

    } catch (error) {
        console.error("Error fetching weather:", error);
        // Fallback to last cached if available (even if old)
        const lastCached = await WeatherData.findOne({ solar_unit_id: solarUnitId }).sort({ timestamp: -1 });
        if (lastCached) {
            return {
                temperature: lastCached.temperature!,
                cloudcover: lastCached.cloudcover!,
                windspeed: lastCached.windspeed!,
                shortwave_radiation: lastCached.shortwave_radiation!,
                impact_level: lastCached.impact_level as "Optimal" | "Degraded" | "Poor",
                timestamp: lastCached.timestamp,
                city: (solarUnit as any).city,
                country: (solarUnit as any).country,
            };
        }
        throw new Error("Weather data unavailable");
    }
};
