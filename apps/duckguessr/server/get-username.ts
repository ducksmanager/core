import { existsSync, readFileSync } from 'fs'
import cookie from 'cookie'

export const getUsername = (cookieContents: string) => {
  const cookies = cookie.parse(cookieContents)
  const { PHPSESSID: sessionId, 'duckguessr-id': duckguessrId } = cookies
  if (duckguessrId && /^user[0-9]+$/.test(duckguessrId)) {
    return duckguessrId
  }
  const sessionFilePath = `${process.env.SESSION_PATH}/sess_${sessionId}`
  const sessionExists = existsSync(sessionFilePath)
  if (sessionExists) {
    const fileContents = readFileSync(sessionFilePath).toString()
    const [, username] = fileContents.match(/App\\Security\\User username";s:\d+:"([^"]+)/)
    return username
  }
  return null
}
