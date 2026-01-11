"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var analytics_controller_1 = require("../controllers/analytics.controller");
var router = express_1.default.Router();
router.get("/:solarUnitId", analytics_controller_1.getDashboardMetrics);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map