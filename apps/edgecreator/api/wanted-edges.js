import axios from 'axios'
import { addAxiosInterceptor } from './api'

addAxiosInterceptor()

export default async function (req, res) {
  const wantedEdges = await axios.get(`${process.env.BACKEND_URL}/edges/wanted`).catch((e) => {
    console.error(e)
    res.writeHead(500, { Connection: 'close' })
  })
  res.writeHead(200, { Connection: 'close', 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      wantedEdges: wantedEdges.data,
    })
  )
}
