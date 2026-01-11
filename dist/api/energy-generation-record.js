"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var energy_controller_1 = require("./controllers/energy.controller");
var authentication_middleware_1 = require("./middlewares/authentication-middleware");
var energyGenerationRecordRouter = express_1.default.Router();
energyGenerationRecordRouter
    .route("/solar-unit/:id")
    .get(authentication_middleware_1.authenticationMiddleware, energy_controller_1.getEnergyStats);
exports.default = energyGenerationRecordRouter;
//# sourceMappingURL=energy-generation-record.js.map