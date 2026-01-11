"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_CONSTANTS = exports.PaymentStatus = exports.AnomalyStatus = exports.AnomalySeverity = exports.AnomalyType = exports.SolarUnitStatus = void 0;
var SolarUnitStatus;
(function (SolarUnitStatus) {
    SolarUnitStatus["ACTIVE"] = "ACTIVE";
    SolarUnitStatus["INACTIVE"] = "INACTIVE";
    SolarUnitStatus["MAINTENANCE"] = "MAINTENANCE";
})(SolarUnitStatus || (exports.SolarUnitStatus = SolarUnitStatus = {}));
var AnomalyType;
(function (AnomalyType) {
    AnomalyType["ZERO_GENERATION"] = "ZERO_GENERATION";
    AnomalyType["SUDDEN_DROP"] = "SUDDEN_DROP";
    AnomalyType["ERRATIC_FLUCTUATION"] = "ERRATIC_FLUCTUATION";
    AnomalyType["PERFORMANCE_DEGRADATION"] = "PERFORMANCE_DEGRADATION";
    AnomalyType["INVERTER_OFFLINE"] = "INVERTER_OFFLINE";
    AnomalyType["PANEL_SHADING"] = "PANEL_SHADING";
    AnomalyType["GRID_INSTABILITY"] = "GRID_INSTABILITY";
    AnomalyType["TEMPERATURE_OVERHEAT"] = "TEMPERATURE_OVERHEAT";
})(AnomalyType || (exports.AnomalyType = AnomalyType = {}));
var AnomalySeverity;
(function (AnomalySeverity) {
    AnomalySeverity["CRITICAL"] = "CRITICAL";
    AnomalySeverity["WARNING"] = "WARNING";
    AnomalySeverity["INFO"] = "INFO";
})(AnomalySeverity || (exports.AnomalySeverity = AnomalySeverity = {}));
var AnomalyStatus;
(function (AnomalyStatus) {
    AnomalyStatus["NEW"] = "NEW";
    AnomalyStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    AnomalyStatus["RESOLVED"] = "RESOLVED";
})(AnomalyStatus || (exports.AnomalyStatus = AnomalyStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["OVERDUE"] = "OVERDUE";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
exports.SYSTEM_CONSTANTS = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SYNC_BATCH_SIZE: 1000,
};
//# sourceMappingURL=constants.js.map