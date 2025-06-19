import { Router } from "express";
import { generateUniqueToken } from "../controllers/user_auth.controller";

const extensionRouter = Router();
extensionRouter.route("/generate-token").post(generateUniqueToken);

export default extensionRouter;
