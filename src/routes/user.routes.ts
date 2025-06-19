import { Router } from "express";
import { userAuth } from "../controllers/user_auth.controller";

const userRouter = Router();
userRouter.route("/authorize").post(userAuth);

export default userRouter;
