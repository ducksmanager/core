import { existsSync, readFileSync } from 'fs'
import Index, { PrismaClient } from '@prisma/client'

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

export const getPlayerGameStatistics = async (
  player: Index.player,
  gameId: number
): Promise<{ [key: string]: number }[]> =>
  await prisma.$queryRaw`
    SELECT (SELECT COUNT(*)
            FROM round_score
                   INNER JOIN round ON round_score.round_id = round.id
            WHERE player_id = ${player.id}
              AND round.game_id = ${gameId}
              AND time_spent_guessing < 2000) AS ultra_fast
      ,
           (SELECT COUNT(*)
            FROM round_score
                   INNER JOIN round ON round_score.round_id = round.id
            WHERE player_id = ${player.id}
              AND round.game_id = ${gameId}
              AND time_spent_guessing < 5000)
                                              AS fast
  `

export const getPlayerStatistics = async (
  player: Index.player
): Promise<{ [key: string]: number }[]> =>
  await prisma.$queryRaw`
    SELECT (SELECT COUNT(*)
            FROM game_scores
                   INNER JOIN game g ON game_scores.game_id = g.id
            WHERE player_id = ${player.id}
              AND game_score = (SELECT MAX(game_score)
                                FROM game_scores game_scores2
                                WHERE game_scores.game_id = game_scores2.game_id)
              AND g.dataset_id = (SELECT id FROM dataset WHERE name = 'published-fr-recent'))
                                              AS "published-fr-recent",
           (SELECT COUNT(*)
            FROM round_score
            WHERE player_id = ${player.id}
              AND time_spent_guessing < 2000) AS ultra_fast
      ,
           (SELECT COUNT(*)
            FROM round_score
            WHERE player_id = ${player.id}
              AND time_spent_guessing < 5000)
                                              AS fast
  `
