import { Router } from "express";
import {
  logoutUser,
  userAuth,
  verifyUser,
} from "../controllers/user_auth.controller";
import veriyUserAuth from "../middlewares/auth";

const userRouter = Router();
userRouter.route("/authorize").post(userAuth);
userRouter.route("/verify-user-auth").post(veriyUserAuth, verifyUser);
userRouter.route("/logout").post(veriyUserAuth, logoutUser);

export default userRouter;
