import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { prisma } from "../db";
import { v7 as uuid } from "uuid";
import { Decimal } from "@prisma/client/runtime/library";

const calcPrevDate = () => {
  const yesterday = new Date(Date.now() - 86400 * 1000);
  return `${yesterday.getFullYear()}-${
    yesterday.getMonth() < 10
      ? `0${yesterday.getMonth()}`
      : yesterday.getMonth()
  }-${
    yesterday.getDate() < 10
      ? `0${yesterday.getDate()}`
      : `${yesterday.getDate()}`
  }`;
};

type StatsInput = {
  totalTimeSeconds: Decimal;
  totalTimeMinutes: Decimal;
  totalWords: number;
  totalLines: number;
  date: string;
};

type Output = {
  gitDate: string;
  count: number;
  level: number;
};

function calculateUserLevel(input: StatsInput): Output {
  const { totalTimeSeconds, totalTimeMinutes, totalWords, totalLines, date } =
    input;

  const minutes = totalTimeMinutes.toNumber();

  const count = Math.round(minutes) * 2 + totalWords * 1 + totalLines * 3;

  let level = 1;
  if (count >= 300 && count < 1000) level = 2;
  else if (count >= 1000 && count < 2000) level = 3;
  else if (count >= 2000) level = 4;

  return {
    gitDate: date,
    count,
    level,
  };
}

const createUserStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const payload = req.body.payload;
    if (!payload.username || !payload.uniqueId) {
      throw new ApiError(401, "payload is empty");
    }
    const userExist = await prisma.userAccount.findFirst({
      where: { uniqueId: payload.uniqueId },
    });
    if (!userExist) {
      await prisma.userAccount.create({
        data: {
          name: payload.name,
          username: payload.username,
          uniqueId: payload.uniqueId,
          email: payload.email,
        },
      });
      await prisma.streak.create({
        data: {
          date: payload.date,
          streak: 0,
          username: payload.username,
          uniqueId: payload.uniqueId,
        },
      });
    }
    res
      .status(200)
      .send(
        new ApiResponse(200, "SuccessFully create userAccount", "createUser")
      );
    return;

    return;
  } catch (error: any) {
    const errorStr = `Error has occurred on UserAuth: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});

const gettingUserTimeSpent = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const payload = req.body.payload;
      if (!payload) {
        throw new ApiError(401, "message is empty");
      }
      const earlyMorning = "1";
      const lateNight = "2";

      const {
        date,
        user,
        email,
        totalTimeSeconds,
        totalTimeMinutes,
        totalWords,
        totalLines,
        languages,
        uniqueId,
      } = payload;

      const prevDay = calcPrevDate();
      var streakResponse = await prisma.streak.findFirst({
        where: {
          uniqueId,
        },
      });

      if (streakResponse) {
        if (streakResponse?.date != date) {
          if (streakResponse?.date === prevDay) {
            streakResponse.streak += 1;
          } else {
            streakResponse.streak = 0;
          }
          await prisma.streak.update({
            where: {
              uniqueId: streakResponse?.uniqueId,
            },
            data: {
              date: payload.date,
              streak: streakResponse?.streak,
            },
          });
        }
      }

      const userDailyStatsResponse = await prisma.userDailyStats.findUnique({
        where: {
          uniqueId_date: {
            uniqueId: uniqueId,
            date: date,
          },
        },
      });
      var response;
      if (!userDailyStatsResponse) {
        response = await prisma.userDailyStats.create({
          data: {
            uniqueId: uniqueId,
            date,
            totalTimeSeconds,
            totalTimeMinutes,
            totalWords,
            totalLines,
            languages,
            earlyMorning,
            lateNight,
            username: user,
            email: email,
          },
        });
      } else {
        response = await prisma.userDailyStats.update({
          where: {
            uniqueId_date: {
              uniqueId: userDailyStatsResponse.uniqueId,
              date: date,
            },
          },
          data: {
            uniqueId: uniqueId,
            date,
            totalTimeSeconds: { increment: totalTimeSeconds },
            totalTimeMinutes: { increment: totalTimeMinutes },
            totalWords: { increment: totalWords },
            totalLines: { increment: totalLines },
            languages,
            earlyMorning,
            lateNight,
            username: user,
            email: email,
          },
        });
      }
      const languageEntry = await prisma.languages.findUnique({
        where: { uniqueId },
      });

      if (languageEntry) {
        const existingLanguages = languageEntry?.language || [];
        const newIncomingLanguages = payload.languages || [];

        const languageSet = new Set([
          ...existingLanguages,
          ...newIncomingLanguages,
        ]);
        const updatedLanguageArray = Array.from(languageSet);
        if (updatedLanguageArray != existingLanguages) {
          await prisma.languages.update({
            where: { uniqueId },
            data: {
              language: updatedLanguageArray,
            },
          });
        }
      }
      const { gitDate, count, level } = calculateUserLevel({
        totalTimeSeconds: response.totalTimeSeconds,
        totalTimeMinutes: response.totalTimeMinutes,
        totalWords: response.totalWords,
        totalLines: response.totalLines,
        date: response.date,
      });
      await prisma.gitStreak.update({
        where: {
          uniqueId: uniqueId,
        },
        data: { gitDate, count, level },
      });
      res
        .status(200)
        .send(new ApiResponse(200, "Successfully done the operations"));
    } catch (error: any) {
      const errorStr = `Error has occurred on UserAuth: ${error.message}`;
      console.log(errorStr);
      res
        .status(error.statusCode || 500)
        .send(new ApiError(error.statusCode || 500, errorStr));
    }
  }
);

const getUserStat = asyncHandler(async (req: Request, res: Response) => {
  try {
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    const today = `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;

    const userStat = await prisma.userDailyStats.findFirst({
      where: { date: today },
    });
    console.log(userStat);
  } catch (error: any) {
    const errorStr = `Error has occurred on getUserStat: ${error.message}`;
    console.log(errorStr);
    res
      .status(error.statusCode || 500)
      .send(new ApiError(error.statusCode || 500, errorStr));
  }
});

// const generateuniqueId = asyncHandler(async (req: Request, res: Response) => {
//   try {
//     const uniqueId = uuid();
//     const userName = req.body.username;
//     if (!userName || !uniqueId) {
//       throw new ApiError(402, "uniqueId or userName is empty");
//     }
//     const findAcc = await prisma.userAccount.findFirst({
//       where: {
//         username: userName,
//       },
//     });
//     if (findAcc?.id) {
//       res.status(200).send(
//         new ApiResponse(200, "Successfully get the old token", {
//           uniqueId: findAcc.uniqueId,
//           userName: findAcc.username,
//         })
//       );
//       return;
//     }
//     res.status(200).send(
//       new ApiResponse(200, "Successfully Created the token", {
//         uniqueId: uniqueId,
//         userName: userName,
//       })
//     );
//     return;
//   } catch (error: any) {
//     const errorStr = `Error has occurred on generateuniqueId: ${error?.message}`;
//     console.log(errorStr);
//     res
//       .status(error.statusCode || 500)
//       .send(new ApiError(error.statusCode || 500, errorStr));
//   }
// });
export {
  gettingUserTimeSpent,
  createUserStats,
  calculateUserLevel,
  getUserStat,
};
