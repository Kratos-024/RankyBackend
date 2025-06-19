import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verify } from "jsonwebtoken";

const veriyUserAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.headers.authorization || req.cookies.refreshToken;
    if (!refreshToken) {
      const errorResponse = {
        message: "Refresh token is not present please login",
        statusCode: 403,
        data: { refreshToken: "" },
      };

      throw new Error(`${errorResponse}`);
    }
    const refreshTokenSecret = process.env.REFRESHTOKENSECRET
      ? process.env.REFRESHTOKENSECRET
      : false;
    if (!refreshTokenSecret) {
      const errorResponse = {
        message: "Refresh token Secret not present please login",
        statusCode: 500,
        data: { refreshToken: "" },
      };

      throw new Error(`${errorResponse}`);
    }

    const verifyTheToken = verify(refreshToken, refreshTokenSecret);
    if (!verifyTheToken) {
      const errorResponse = {
        message: "Verification of token failed",
        statusCode: 403,
        data: { refreshToken: "" },
      };

      throw new Error(`${errorResponse}`);
    }
    next();
  } catch (error: any) {
    const errorStr = `Error has been occrued on middleware, ${error.errorResponse.message}`;
    const statusCode = error.errorResponse.statusCode || 500;
    res
      .status(statusCode)
      .send(new ApiError(statusCode, errorStr, error.errorResponse.data));
    return;
  }
};

export default veriyUserAuth;
