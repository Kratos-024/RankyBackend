import { Router } from "express";
import { getTheMessage, userAuth } from "../controllers/user_auth.controller";

const userRouter = Router();
userRouter.route("/authorize").post(userAuth);
userRouter.route("/getTheMessage").post(getTheMessage);

export default userRouter;
