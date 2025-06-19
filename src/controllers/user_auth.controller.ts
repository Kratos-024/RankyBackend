import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { prisma } from "../db";
import { Jwt, JwtPayload, sign } from "jsonwebtoken";

const generateAccessToken = (data: any) => {
  try {
    const accessSecret = process.env.ACCESSTOKENSECRET;
    if (!accessSecret) {
      throw new Error("ERROR has been occured on generating Access Token");
    }
    const refreshSecret = process.env.REFRESHTOKENSECRET;
    const access_token = sign(data, accessSecret, { expiresIn: `${1}Hour` });
    return access_token;
  } catch (error) {
    console.log("Error", error);
  }
};
const generatRefreshToken = (data: any) => {
  try {
    const refreshSecret = process.env.REFRESHTOKENSECRET;
    if (!refreshSecret) {
      throw new Error("ERROR has been occured on generating Refresh Token");
    }
    const refresh_token = sign(data, refreshSecret, { expiresIn: `${1}Weeks` });
    return refresh_token;
  } catch (error) {
    console.log("Error", error);
  }
};

const generateAccessAndRefreshToken = (data: any) => {
  try {
    const access_token = generateAccessToken(data);
    const refresh_token = generatRefreshToken(data);
    return { access_token, refresh_token };
  } catch (error) {
    console.log("Error", error);
  }
};
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
    const gitToken_ = (await authorizingUser.text())
      .split("&")[0]
      .split("=")[1];
    console.log("gitToken_gitToken_gitToken_gitToken_", gitToken_);
    const gitToken = process.env.TOEKN;
    const userInfoResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${gitToken_}`,
      },
    });
    const userInfoData = await userInfoResponse.json();

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
const createAccountAndSendAuth = async (
  req: Request,
  res: Response,
  data: any
) => {
  try {
    const { email, avatar_url, name, bio, twitter_username, login } = data;
    const findUser = await prisma.userAccount.findFirst({
      where: {
        email,
        username: login,
      },
    });
    if (!findUser) {
      const createAccount = await prisma.userAccount.create({
        data: {
          email,
          avatar_url,
          name,
          bio,

          refreshToken,
          accessToken,
        },
      });
      res
        .send(200)
        .send(
          new ApiResponse(200, "Successfully Login to account", createAccount)
        );
      return;
    } else {
      const loginToAccount = await prisma.userAccount.update({
        where: {
          email,
          username: login,
        },
        data: { refreshToken, accessToken },
      });
      res
        .send(200)
        .send(
          new ApiResponse(200, "Successfully Login to account", loginToAccount)
        );
      return;
    }
  } catch (error) {}
};

export { userAuth };
