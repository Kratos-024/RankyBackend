import { Router } from "express";
import {
  createUserStats,
  gettingUserTimeSpent,
  getUserStat,
} from "../controllers/extension.controller";

const extensionRouter = Router();
extensionRouter.route("/coding-stats").post(gettingUserTimeSpent);
extensionRouter.route("/get-stats").get(getUserStat);
extensionRouter.route("/create-stats").post(createUserStats);

export default extensionRouter;
