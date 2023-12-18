import jwt from "jsonwebtoken";

import { player, PrismaClient } from "./prisma/client_duckguessr";

const prisma = new PrismaClient();

export const getUser = async (username: string) =>
  (await prisma.player.findFirst({
    where: {
      username,
    },
  }))!;

export const getPlayer = async (
  cookies: Record<string, string>
) => {
  const { token, "duckguessr-user": duckguessrName } = cookies;
  let player: player | null;
  if (token) {
    console.log(process.env.TOKEN_SECRET);
    try {
      const { id: ducksmanagerId, username } = jwt.verify(
        token,
        process.env.TOKEN_SECRET as string
      ) as jwt.JwtPayload;
      player = await prisma.player.findFirst({
        where: {
          ducksmanagerId,
        },
      });
      if (player) {
        console.log("Player exists");
      } else {
        console.log("Player is created");
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
      return null;
    }
  }
  if (duckguessrName && /^user\d+$/.test(duckguessrName)) {
    player = await prisma.player.findFirst({
      where: {
        username: duckguessrName,
      },
    });
    if (!player) {
      player = await prisma.player.create({
        data: {
          username: duckguessrName,
        },
      });
    }
  }
  return player!;
};

export const updatePlayer = async (
  playerId: number,
  player: player
) =>
  await prisma.player.update({
    where: { id: playerId },
    data: player,
  });

export const getPlayerGameStatistics = async (
  gameId: number
) => await prisma.userGameMedalPoints.findMany({
  where: {
    gameId,
    medalType: {
      notIn: ['published-fr-small']
    }
  }
})

export const getPlayerStatistics = async (
  playerIds: number[]
) => await prisma.userMedalPoints.findMany({
  where: {
    playerId: {
      in: playerIds,
    },
    medalType: {
      notIn: ['published-fr-small']
    }
  }
})