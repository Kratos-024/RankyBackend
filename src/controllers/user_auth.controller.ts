import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const userAuth = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userAuthCode = req.body.code;
    if (!userAuthCode) {
      throw new ApiError(401, "userAuthCode is empty");
    }
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = "http://localhost/5173/profile";

    const authorizingUser = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code: userAuthCode,
          redirect_uri,
        }),
      }
    );

    const data = await authorizingUser.text();

    const gitToken = process.env.TOEKN;
    const userInfoResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${gitToken}`,
      },
    });
    const userInfoData = await userInfoResponse.json();
    console.log("User infoUser infoUser infoUser info", userInfoData);
    res
      .status(200)
      .send(
        new ApiResponse(200, "Successfully get the user info", userInfoData)
      );
  } catch (error: any) {
    const errorStr = `Error has occurred on UserAuth: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});

const getTheMessage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const message = req.body.message;
    if (!message) {
      throw new ApiError(401, "message is empty");
    }
    console.log(message);
  } catch (error: any) {
    const errorStr = `Error has occurred on UserAuth: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});

export { userAuth, getTheMessage };
