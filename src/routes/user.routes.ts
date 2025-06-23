import { Router } from "express";
import {
  generateAuthToken,
  getUserStats,
  logoutUser,
  userAuth,
  verifyExtensionAuth,
  verifyUser,
} from "../controllers/user_auth.controller";
import veriyUserAuth from "../middlewares/auth";

const userRouter = Router();
userRouter.route("/authorize").post(userAuth);
userRouter.route("/verify-user-auth").post(veriyUserAuth, verifyUser);
userRouter.route("/verify-extension-auth").post(verifyExtensionAuth);
userRouter.route("/get-user-stats").post(veriyUserAuth, getUserStats);
userRouter.route("/logout").post(veriyUserAuth, logoutUser);
userRouter.route("/generateSecret").post(veriyUserAuth, generateAuthToken);

export default userRouter;
