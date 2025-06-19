import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verify } from "jsonwebtoken";

const verifyUserAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers.authorization || req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(403, "Refresh token is not present, please login", {
        refreshToken: "",
      });
    }

    const refreshTokenSecret = process.env.REFRESHTOKENSECRET;
    if (!refreshTokenSecret) {
      throw new ApiError(
        500,
        "Refresh token secret not present in environment",
        {
          refreshToken: "",
        }
      );
    }

    const verifyTheToken = verify(refreshToken, refreshTokenSecret);
    if (!verifyTheToken) {
      throw new ApiError(403, "Verification of token failed", {
        refreshToken: "",
      });
    }

    next();
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message =
      error.message || "Unexpected error occurred in auth middleware";
    const data = error.data || {};

    res.status(statusCode).send(new ApiError(statusCode, message, data));
  }
};

export default verifyUserAuth;
