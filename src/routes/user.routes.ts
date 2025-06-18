import { Router } from "express";
import {
  gettingUserTimeSpent,
  userAuth,
} from "../controllers/user_auth.controller";

const userRouter = Router();
userRouter.route("/authorize").post(userAuth);
userRouter.route("/coding-stats").post(gettingUserTimeSpent);

export default userRouter;
