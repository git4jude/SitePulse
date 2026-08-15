import express from "express";
import auth from "../middleware/auth.js";
import {
  addKeyword,
  getKeywords,
  getKeyword,
  refreshKeyword,
  deleteKeyword,
  toggleKeyword,
  getCronStatus,
} from "../controllers/rankController.js";

const rankRouter = express.Router();

rankRouter.post("/add", auth, addKeyword);
rankRouter.get("/list", auth, getKeywords);
rankRouter.get("/cron-status", auth, getCronStatus);
rankRouter.get("/:id", auth, getKeyword);
rankRouter.post("/:id/refresh", auth, refreshKeyword);
rankRouter.patch("/:id/toggle", auth, toggleKeyword);
rankRouter.delete("/:id", auth, deleteKeyword);

export default rankRouter;
