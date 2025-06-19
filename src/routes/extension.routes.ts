import { Router } from "express";
import {
  generateUniqueToken,
  gettingUserTimeSpent,
  getUserStat,
} from "../controllers/extension.controller";

const extensionRouter = Router();
extensionRouter.route("/generate-token").post(generateUniqueToken);
extensionRouter.route("/coding-stats").post(gettingUserTimeSpent);
extensionRouter.route("/get-stats").get(getUserStat);

export default extensionRouter;
