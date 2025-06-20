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

const userAuth = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userAuthCode = req.body.code;
    if (!userAuthCode) {
      throw new ApiError(401, "userAuthCode is empty");
    }
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = "http://localhost/5173";

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
    const userInfoResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${gitToken_}`,
      },
    });
    const userInfoData = await userInfoResponse.json();
    const response = await createAndLoginAccountAndSendAuth(userInfoData);
    res
      .status(200)
      .send(new ApiResponse(200, "Successfully get the user info", response));
  } catch (error: any) {
    const errorStr = `Error has occurred on UserAuth: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});
const createAndLoginAccountAndSendAuth = async (data: any) => {
  try {
    const { email, avatar_url, name, bio, twitter_username, login } = data;
    const findUser = await prisma.userAccount.findFirst({
      where: {
        email,
        username: login,
      },
    });
    const refreshToken = generatRefreshToken({
      email,
      name,
      login,
    });
    const accessToken = generateAccessToken({
      email,
      avatar_url,
      name,
      bio,
      twitter_username,
      login,
    });

    if (!findUser) {
      const createAccount = await prisma.userAccount.create({
        data: {
          email,
          avatar_url,
          name,
          bio,
          username: login,
          refreshToken,
          accessToken,
        },
      });

      const response = {
        message: "Successfully Login to account",
        statusCode: 200,
        data: createAccount,
      };

      return response;
    } else {
      const loginToAccount = await prisma.userAccount.update({
        where: {
          username: login,
        },
        data: { refreshToken, accessToken },
      });

      const response = {
        message: "Successfully Login to account",
        statusCode: 200,
        data: loginToAccount,
      };

      return response;
    }
  } catch (error: any) {
    const errorStr = `Error has occurred on UserAuth: ${error.message}`;
    console.log(errorStr);
    const errorResponse = {
      statusCode: 500,
      message: errorStr,
    };
    return errorResponse;
  }
};

const verifyUser = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).send(new ApiResponse(201, "Successfully verify the user"));
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const username = req.body.username || req.query.username;

    if (!username) {
      throw new ApiError(400, "Username is required to logout");
    }

    const user = await prisma.userAccount.findUnique({
      where: { username: String(username) },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await prisma.userAccount.update({
      where: { username: String(username) },
      data: {
        accessToken: "",
        refreshToken: "",
      },
    });

    res.status(200).send(new ApiResponse(200, "Successfully logged out", null));
  } catch (error: any) {
    const errorStr = `Error during logout: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});

export { userAuth, verifyUser, logoutUser };
