/* eslint-disable import/no-named-as-default-member */
import Index, { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { UserGameMedalPoints, UserMedalPoints } from '../types/playerStats'

const prisma = new PrismaClient()

export const getUser = async (username: string): Promise<Index.player> =>
  (await prisma.player.findFirst({
    where: {
      username,
    },
  }))!

export const getPlayer = async (cookies: { [key: string]: any }): Promise<Index.player | null> => {
  const { token, 'duckguessr-user': duckguessrName } = cookies
  let player: Index.player | null
  if (token) {
    console.log(process.env.TOKEN_SECRET)
    try {
      const { id: ducksmanagerId, username } = jwt.verify(
        token,
        process.env.TOKEN_SECRET as string
      ) as jwt.JwtPayload
      player = await prisma.player.findFirst({
        where: {
          ducksmanager_id: ducksmanagerId,
        },
      })
      if (player) {
        console.log('Player exists')
      } else {
        console.log('Player is created')
        player = await prisma.player.create({
          data: {
            ducksmanager_id: ducksmanagerId,
            username,
          },
        })
      }
      return player
    } catch (error) {
      console.error(error)
      return null
    }
  }
  if (duckguessrName && /^user\d+$/.test(duckguessrName)) {
    player = await prisma.player.findFirst({
      where: {
        username: duckguessrName,
      },
    })
    if (!player) {
      player = await prisma.player.create({
        data: {
          username: duckguessrName,
        },
      })
    }
  }
  return player!
}

export const updatePlayer = async (playerId: number, player: Index.player): Promise<Index.player> =>
  await prisma.player.update({
    where: { id: playerId },
    data: player,
  })

export const getPlayerGameStatistics = async (gameId: number): Promise<UserGameMedalPoints[]> =>
  await prisma.$queryRaw`
    SELECT *
    FROM user_medals_game
    WHERE game_id = ${gameId}
      AND medal_type NOT IN ('published-fr-small')
  `

export const getPlayerStatistics = async (playerIds: number[]): Promise<UserMedalPoints[]> =>
  await prisma.$queryRaw`
    SELECT *
    FROM user_medals
    WHERE player_id IN (${playerIds.join(',')})
      AND medal_type NOT IN ('published-fr-small')

  `
