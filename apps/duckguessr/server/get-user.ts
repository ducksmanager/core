import { existsSync, readFileSync } from 'fs'
import Index, { PrismaClient } from '@prisma/client'
const { parse: parseCookie } = require('cookie')

const prisma = new PrismaClient()

export const getBotUser = async (botUsername: string): Promise<Index.player> =>
  (await prisma.player.findFirst({
    where: {
      username: botUsername,
    },
  }))!

export const getUser = async (cookieContents: string): Promise<Index.player> => {
  const cookies = parseCookie(cookieContents)
  const { PHPSESSID: sessionId, 'duckguessr-user': duckguessrName } = cookies
  let user: Index.player | null
  if (sessionId) {
    const sessionFilePath = `${process.env.SESSION_PATH}/sess_${sessionId}`
    const sessionExists = existsSync(sessionFilePath)
    if (sessionExists) {
      const fileContents = readFileSync(sessionFilePath).toString()
      const match = fileContents.match(
        /i:(\d+);s:\d+:".?App\\Security\\User.?username";s:\d+:"([^"]+)/
      )
      if (!match) {
        throw new Error(`Invalid cookie: ${cookieContents}`)
      }
      const ducksmanagerId = parseInt(match[1])
      const username = match[2]
      user = await prisma.player.findFirst({
        where: {
          ducksmanager_id: ducksmanagerId,
        },
      })
      if (!user) {
        user = await prisma.player.create({
          data: {
            ducksmanager_id: ducksmanagerId,
            username,
          },
        })
      }
      return user
    }
  }
  if (duckguessrName && /^user\d+$/.test(duckguessrName)) {
    user = await prisma.player.findFirst({
      where: {
        username: duckguessrName,
      },
    })
    if (!user) {
      user = await prisma.player.create({
        data: {
          username: duckguessrName,
        },
      })
    }
  }
  return user!
}
