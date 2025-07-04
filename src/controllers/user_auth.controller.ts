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
    console.log("gitkljdgkgjgkdgskg", gitToken_);
    const userInfoResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${gitToken_}`,
      },
    });
    const userInfoData = await userInfoResponse.json();
    console.log(
      "vvvvvvvuserInfoDatauserInfoDatauserInfoDatauserInfoDatauserInfoData",
      userInfoResponse
    );
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
    const { email, avatar_url, name, bio, twitter_username, login, id } = data;
    const findUser = await prisma.userAccount.findFirst({
      where: {
        uniqueId: `${id}`,
      },
    });
    const refreshToken = generatRefreshToken({
      email,
      name,
      login,
      id: `${id}`,
    });
    const accessToken = generateAccessToken({
      email,
      avatar_url,
      name,
      bio,
      twitter_username,
      login,
      id: `${id}`,
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
          uniqueId: `${id}`,
        },
      });

      const response = {
        message: "Successfully Login to account",
        statusCode: 200,
        data: createAccount,
      };
      console.log(response);

      return response;
    } else {
      const loginToAccount = await prisma.userAccount.update({
        where: {
          username: login,
        },
        data: { refreshToken, accessToken, email, username: login },
      });

      const response = {
        message: "Successfully Login to account",
        statusCode: 200,
        data: loginToAccount,
      };
      console.log(response);
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

const verifyExtensionAuth = asyncHandler(
  async (req: Request, res: Response) => {
    console.log(
      "sdlkfjsdfjdsklfdsklfsdlkfsdklf",
      " sdlkfjsdfjdsklfdsklfsdlkfsdkl" +
        "sdlkfjsdfjdsklfdsklfsdlkfsdklfsdlkfjsdfjdsklfdsklfsdlkfsdklfsdlkfjsdfjdsklfdsklfsdlkfsdklf"
    );

    const { userId } = req.body;
    console.log("sdlkfjsdfjdsklfdsklfsdlkfsdklf", userId);
    if (!userId) {
      throw new ApiError(400, "userId is required");
    }

    try {
      const userExist = await prisma.userAccount.findFirst({
        where: {
          uniqueId: userId,
        },
      });
      if (!userExist) {
        throw new ApiError(400, "User doesnt exist");
      }

      res.status(200).send(
        new ApiResponse(200, "Authentication verified successfully", {
          success: true,
          userId: userId,
          message: "Successfully verified the user",
        })
      );
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid token");
      } else if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Token has expired");
      } else if (error.name === "NotBeforeError") {
        throw new ApiError(401, "Token not active yet");
      } else {
        // Re-throw ApiError instances
        if (error instanceof ApiError) {
          throw error;
        }
        // Handle other unexpected errors
        throw new ApiError(500, "Token verification failed");
      }
    }
  }
);
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

const generateAuthToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log("jksfgshkklsdkdlsf");
    const payload = req.body.payload;
    if (!payload) {
      console.log("payload,payload", payload);

      throw new ApiError(403, "ERROR has been occured on generating Token");
    }
    console.log("vvvv", payload);
    const tokenSecret = process.env.TOKENSECRET || "signedToken";
    const signedToken = sign(payload, tokenSecret);
    console.log(signedToken);
    res
      .status(201)
      .send(new ApiResponse(201, "Token generated Successfully", signedToken));
  } catch (error: any) {
    const errorStr = `Error has occurred on generateAuthToken: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});

const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    const userId = req?.user?.id;
    if (!userId) {
      throw new ApiError(401, "Please provide user Id");
    }
    const userStat = await prisma.userAccount.findUnique({
      where: { uniqueId: userId },
      select: {
        gitstreak: true,
        streak: true,
        userdailystats: {
          where: {
            date,
          },
          select: {
            earlyMorning: true,
            lateNight: true,
          },
        },
        languages: true,
      },
    });

    if (!userStat) {
      throw new ApiError(401, "There is no user stat with this user id");
    }
    res
      .status(200)
      .send(
        new ApiResponse(200, "Successfully get the user git streak", userStat)
      );
  } catch (error: any) {
    const errorStr = `Error has occurred on getUserStat: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});
export {
  userAuth,
  verifyUser,
  logoutUser,
  generateAuthToken,
  verifyExtensionAuth,
  getUserStats,
};
