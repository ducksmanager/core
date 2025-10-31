import jwt from "jsonwebtoken";

import prisma from "./prisma/client";
import type { player } from "./prisma/client_duckguessr/browser";

export const getUser = async (username: string) =>
  (await prisma.player.findFirst({
    where: {
      username,
    },
  }))!;

export const getPlayer = async (cookies?: {
  token?: string;
  "duckguessr-user"?: string;
}) => {
  let player: player | null = null;
  if (cookies?.token) {
    try {
      const { id: ducksmanagerId, username } = (jwt.verify(
        cookies.token,
        process.env.TOKEN_SECRET as string,
      ) as jwt.JwtPayload)?.data;
      if (!username) {
        throw new Error("No username provided");
      }
      player = await prisma.player.findUnique({
        where: {
          username,
        },
      });
      if (player) {
        console.log("Player exists");
      } else {
        console.log("Player will be created");
        player = await prisma.player.create({
          data: {
            ducksmanagerId,
            username,
          },
        });
      }
      return player;
    } catch (error) {
      console.error(error);
      throw new Error("No token provided");
    }
  }
  // const duckguessrName = cookies?.["duckguessr-user"];
  // if (duckguessrName && /^user\d+$/.test(duckguessrName)) {
  //   player = await prisma.player.findFirst({
  //     where: {
  //       username: duckguessrName,
  //     },
  //   });
  //   if (!player) {
  //     player = await prisma.player.create({
  //       data: {
  //         username: duckguessrName,
  //       },
  //     });
  //   }
  // }
  // if (!player) {
  //   throw new Error("No token provided");
  // }
  return player!;
};

export const updatePlayer = async (playerId: number, player: player) =>
  await prisma.player.update({
    where: { id: playerId },
    data: player,
  });

export const getPlayerGameStatistics = async (gameId: number) =>
  await prisma.userGameMedalPoints.findMany({
    where: {
      gameId,
      medalType: {
        notIn: ["published-fr-small"],
      },
    },
  });

export const getPlayerStatistics = async (playerIds: number[]) =>
  await prisma.userMedalPoints.findMany({
    where: {
      playerId: {
        in: playerIds,
      },
      medalType: {
        notIn: ["published-fr-small"],
      },
    },
  });
