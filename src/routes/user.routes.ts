import { Router } from "express";
import {
  gettingUserTimeSpent,
  getUserStat,
  userAuth,
} from "../controllers/user_auth.controller";

const userRouter = Router();
userRouter.route("/authorize").post(userAuth);
userRouter.route("/coding-stats").post(gettingUserTimeSpent);
userRouter.route("/get-stats").get(getUserStat);

export default userRouter;
