"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var solar_unit_1 = require("../application/solar-unit");
var authentication_middleware_1 = require("./middlewares/authentication-middleware");
var authorization_middleware_1 = require("./middlewares/authorization-middleware");
var sync_middleware_1 = require("./middlewares/sync/sync-middleware");
var solarUnitRouter = express_1.default.Router();
solarUnitRouter.route("/").get(authentication_middleware_1.authenticationMiddleware, authorization_middleware_1.authorizationMiddleware, solar_unit_1.getAllSolarUnits).post(authentication_middleware_1.authenticationMiddleware, authorization_middleware_1.authorizationMiddleware, solar_unit_1.createSolarUnitValidator, solar_unit_1.createSolarUnit);
solarUnitRouter.route("/me").get(authentication_middleware_1.authenticationMiddleware, sync_middleware_1.syncMiddleware, solar_unit_1.getSolarUnitForUser);
solarUnitRouter
    .route("/:id")
    .get(authentication_middleware_1.authenticationMiddleware, authorization_middleware_1.authorizationMiddleware, solar_unit_1.getSolarUnitById)
    .put(authentication_middleware_1.authenticationMiddleware, authorization_middleware_1.authorizationMiddleware, solar_unit_1.updateSolarUnit)
    .delete(authentication_middleware_1.authenticationMiddleware, authorization_middleware_1.authorizationMiddleware, solar_unit_1.deleteSolarUnit);
exports.default = solarUnitRouter;
//# sourceMappingURL=solar-unit.js.map