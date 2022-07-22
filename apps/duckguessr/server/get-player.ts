import { existsSync, readFileSync } from 'fs'
import Index, { PrismaClient } from '@prisma/client'
import { UserGameMedalPoints, UserMedalPoints } from '../types/playerStats'

const prisma = new PrismaClient()

export const getUser = async (username: string): Promise<Index.player> =>
  (await prisma.player.findFirst({
    where: {
      username,
    },
  }))!

export const getPlayer = async (cookies: { [key: string]: any }): Promise<Index.player | null> => {
  const { PHPSESSID: sessionId, 'duckguessr-user': duckguessrName } = cookies
  let player: Index.player | null
  if (sessionId) {
    const sessionFilePath = `${process.env.SESSION_PATH}/sess_${sessionId}`
    const sessionExists = existsSync(sessionFilePath)
    if (sessionExists) {
      console.log('Session exists')
      const fileContents = readFileSync(sessionFilePath).toString()
      const match = fileContents.match(
        /i:(\d+);s:\d+:".?App\\Security\\User.?username";s:\d+:"([^"]+)/
      )
      if (!match) {
        console.log(`Invalid cookie: ${JSON.stringify(cookies)}`)
        return null
      }
      const ducksmanagerId = parseInt(match[1])
      const username = match[2]
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
