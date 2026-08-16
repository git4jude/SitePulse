import express from "express";
import { triggerRankTrackingCron } from "../controllers/cronController.js";

const cronRouter = express.Router();

cronRouter.get("/rank-tracking", triggerRankTrackingCron);

export default cronRouter;
