import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { prisma } from "../db";
import { Decimal } from "@prisma/client/runtime/library";
const TIME_WEIGHT = 2;
const WORDS_WEIGHT = 0.1;
const LINES_WEIGHT = 0.2;

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
  totalTimeMinutes: Decimal;
  totalWords: number;
  totalLines: number;
  date: string;
};

type Output = {
  gitDate: string;
  count: number;
  level: number;
  intensity: "none" | "low" | "medium" | "high" | "very-high";
};

function calculateUserLevelAndCount(input: StatsInput): Output {
  const { totalTimeMinutes, totalWords, totalLines, date } = input;

  const minutes = totalTimeMinutes.toNumber();
  const timeScore = Math.round(minutes * TIME_WEIGHT);
  const wordsScore = Math.round(totalWords * WORDS_WEIGHT);
  const linesScore = Math.round(totalLines * LINES_WEIGHT);

  const count = Math.max(0, timeScore + wordsScore + linesScore);

  let level: number;
  let intensity: "none" | "low" | "medium" | "high" | "very-high";

  if (count === 0) {
    level = 0;
    intensity = "none";
  } else if (count < 100) {
    level = 1;
    intensity = "low";
  } else if (count < 500) {
    level = 2;
    intensity = "medium";
  } else if (count < 1000) {
    level = 3;
    intensity = "high";
  } else if (count < 1500) {
    level = 4;
    intensity = "high";
  } else {
    level = 5;
    intensity = "very-high";
  }

  return {
    gitDate: date,
    count,
    level,
    intensity,
  };
}
function updateGitStreak(input: {
  oldLevel: number;
  oldCount: number;
  newLevel: number;
  newCount: number;
}) {
  const { oldLevel, oldCount, newLevel, newCount } = input;
  const count = oldCount + newCount;
  var levelByAdd = oldLevel + newLevel;
  var level;
  if (levelByAdd === 0) {
    level = 0;
  } else if (levelByAdd === 1 || levelByAdd === 2) {
    level = 1;
  } else if (levelByAdd <= 4) {
    level = 2;
  } else if (levelByAdd <= 6) {
    level = 3;
  } else if (levelByAdd <= 8) {
    level = 4;
  } else {
    level = 5;
  }

  return {
    count,
    level,
  };
}

const createUserStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const payload = req.body.payload;

    if (!payload.email || !payload.uniqueId) {
      throw new ApiError(401, "payload is empty");
    }
    const userExist = await prisma.userAccount.findFirst({
      where: { uniqueId: payload.uniqueId },
    });
    if (userExist) {
      await prisma.streak.create({
        data: {
          date: payload.date,
          streak: 0,
          email: payload.email,
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
  } catch (error: any) {
    const errorStr = `Error has occurred on createUserStats: ${error.message}`;
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
      console.log("Hello ji from gettingUserTimeSpent", payload);
      if (!payload) {
        throw new ApiError(402, "Payload is empty");
      }
      const earlyMorning = "1";
      const lateNight = "2";

      const {
        date,
        email,
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
              uniqueId,
              date,
              email,
              streak: streakResponse?.streak,
            },
          });
        }
      } else {
        await prisma.streak.create({
          data: {
            uniqueId,
            date,
            email,
            streak: 0,
          },
        });
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
            totalTimeMinutes,
            totalWords,
            totalLines,
            languages,
            earlyMorning,
            lateNight,
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
            totalTimeMinutes: { increment: totalTimeMinutes },
            totalWords: { increment: totalWords },
            totalLines: { increment: totalLines },
            languages,
            earlyMorning,
            lateNight,
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
      } else {
        await prisma.languages.create({
          data: {
            uniqueId,

            language: languages,
          },
        });
      }
      const { gitDate, count, level } = calculateUserLevelAndCount({
        totalTimeMinutes: response.totalTimeMinutes,
        totalWords: response.totalWords,
        totalLines: response.totalLines,
        date: response.date,
      });
      const isGitStreak = await prisma.gitStreak.findFirst({
        where: {
          uniqueId: uniqueId,
          gitDate: date,
        },
      });

      if (!isGitStreak) {
        await prisma.gitStreak.create({
          data: { uniqueId: uniqueId, gitDate, count, level },
        });
      } else {
        const newStreak = updateGitStreak({
          oldLevel: isGitStreak.level,
          oldCount: isGitStreak.count,
          newLevel: level,
          newCount: count,
        });
        await prisma.gitStreak.update({
          where: {
            gitDate_uniqueId: {
              gitDate: gitDate,
              uniqueId: uniqueId,
            },
          },
          data: {
            count: newStreak.count,
            level: newStreak.level,
          },
        });
      }
      // const isStreak = await prisma.streak.findFirst({
      //   where: {
      //     uniqueId: uniqueId,
      //   },
      // });
      // const newStreak =
      //   isStreak?.date === date
      //     ? isStreak?.streak
      //     : isStreak?.date === prevDay
      //     ? (isStreak.streak += 1)
      //     : 1;
      // await prisma.streak.update({
      //   where: {
      //     uniqueId: uniqueId,
      //   },
      //   data: {
      //     streak: newStreak,
      //     date: date,
      //   },
      // });
      res
        .status(200)
        .send(new ApiResponse(200, "Successfully done the operations"));
    } catch (error: any) {
      const errorStr = `Error has occurred on gettingUserTimeSpent: ${error.message}`;
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

export { gettingUserTimeSpent, createUserStats, getUserStat };
