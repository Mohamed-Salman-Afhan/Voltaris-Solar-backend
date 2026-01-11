import express from "express";
import { getEnergyStats } from "./controllers/energy.controller";
import { authenticationMiddleware } from "./middlewares/authentication-middleware";

const energyGenerationRecordRouter = express.Router();

energyGenerationRecordRouter
  .route("/solar-unit/:id")
  .get(authenticationMiddleware, getEnergyStats);

export default energyGenerationRecordRouter;