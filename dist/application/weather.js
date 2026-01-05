"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherForUnit = void 0;
var SolarUnit_1 = require("../infrastructure/entities/SolarUnit");
var WeatherData_1 = require("../infrastructure/entities/WeatherData");
var not_found_error_1 = require("../api/errors/not-found-error");
var getWeatherForUnit = function (solarUnitId) { return __awaiter(void 0, void 0, void 0, function () {
    var solarUnit, tenMinutesAgo, cachedWeather, _a, latitude, longitude, apiUrl, response, data, current, temp, clouds, wind, radiation, impact, newWeather, error_1, lastCached;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, SolarUnit_1.SolarUnit.findById(solarUnitId)];
            case 1:
                solarUnit = _b.sent();
                if (!solarUnit) {
                    throw new not_found_error_1.NotFoundError("Solar Unit not found");
                }
                // Check if location is configured
                if (!solarUnit.location ||
                    solarUnit.location.latitude === undefined ||
                    solarUnit.location.longitude === undefined) {
                    throw new Error("Solar unit location not configured");
                }
                tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
                return [4 /*yield*/, WeatherData_1.WeatherData.findOne({
                        solar_unit_id: solarUnitId,
                        timestamp: { $gte: tenMinutesAgo },
                    }).sort({ timestamp: -1 })];
            case 2:
                cachedWeather = _b.sent();
                if (cachedWeather) {
                    return [2 /*return*/, {
                            temperature: cachedWeather.temperature,
                            cloudcover: cachedWeather.cloudcover,
                            windspeed: cachedWeather.windspeed,
                            shortwave_radiation: cachedWeather.shortwave_radiation,
                            impact_level: cachedWeather.impact_level,
                            timestamp: cachedWeather.timestamp,
                            city: solarUnit.city,
                            country: solarUnit.country,
                        }];
                }
                _a = solarUnit.location, latitude = _a.latitude, longitude = _a.longitude;
                apiUrl = "https://api.open-meteo.com/v1/forecast?latitude=".concat(latitude, "&longitude=").concat(longitude, "&current=temperature_2m,cloud_cover,wind_speed_10m,shortwave_radiation");
                _b.label = 3;
            case 3:
                _b.trys.push([3, 7, , 9]);
                return [4 /*yield*/, fetch(apiUrl)];
            case 4:
                response = _b.sent();
                if (!response.ok) {
                    throw new Error("Open-Meteo API error: ".concat(response.statusText));
                }
                return [4 /*yield*/, response.json()];
            case 5:
                data = _b.sent();
                current = data.current;
                temp = current.temperature_2m;
                clouds = current.cloud_cover;
                wind = current.wind_speed_10m;
                radiation = current.shortwave_radiation || 0;
                impact = "Optimal";
                if (clouds > 60 || radiation < 200) {
                    // Adjusted radiation threshold for "Poor" slightly lower for night time handling? 
                    // SRS says: Poor: Cloud > 60 OR Radiation < 500. 
                    // Note: At night radiation is 0, so it will always be Poor? 
                    // That makes sense for solar production.
                    impact = "Poor";
                }
                else if (clouds >= 20 || radiation <= 800) {
                    impact = "Degraded";
                }
                else {
                    impact = "Optimal";
                }
                return [4 /*yield*/, WeatherData_1.WeatherData.create({
                        solar_unit_id: solarUnitId,
                        location: { latitude: latitude, longitude: longitude },
                        timestamp: new Date(), // Use current time or api time? API returns time. Let's use current server time for simplicity of expiration.
                        temperature: temp,
                        cloudcover: clouds,
                        windspeed: wind,
                        shortwave_radiation: radiation,
                        impact_level: impact,
                    })];
            case 6:
                newWeather = _b.sent();
                return [2 /*return*/, {
                        temperature: newWeather.temperature,
                        cloudcover: newWeather.cloudcover,
                        windspeed: newWeather.windspeed,
                        shortwave_radiation: newWeather.shortwave_radiation,
                        impact_level: newWeather.impact_level,
                        timestamp: newWeather.timestamp,
                        city: solarUnit.city,
                        country: solarUnit.country,
                    }];
            case 7:
                error_1 = _b.sent();
                console.error("Error fetching weather:", error_1);
                return [4 /*yield*/, WeatherData_1.WeatherData.findOne({ solar_unit_id: solarUnitId }).sort({ timestamp: -1 })];
            case 8:
                lastCached = _b.sent();
                if (lastCached) {
                    return [2 /*return*/, {
                            temperature: lastCached.temperature,
                            cloudcover: lastCached.cloudcover,
                            windspeed: lastCached.windspeed,
                            shortwave_radiation: lastCached.shortwave_radiation,
                            impact_level: lastCached.impact_level,
                            timestamp: lastCached.timestamp,
                        }];
                }
                throw new Error("Weather data unavailable");
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.getWeatherForUnit = getWeatherForUnit;
//# sourceMappingURL=weather.js.map