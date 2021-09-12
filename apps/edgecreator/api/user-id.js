import axios from 'axios'
import { addAxiosInterceptor, getUserCredentials } from './api'

addAxiosInterceptor()

export default async function (req, res) {
  const user = await axios
    .get(`${process.env.BACKEND_URL}/collection/user`, {
      headers: getUserCredentials(req),
    })
    .catch((e) => {
      console.error(e)
      res.writeHead(500, { Connection: 'close' })
    })
  const { id, username } = user.data
  res.writeHead(200, {
    Connection: 'close',
    'Content-Type': 'application/json',
  })
  res.end(
    JSON.stringify({
      id,
      username,
    })
  )
}
