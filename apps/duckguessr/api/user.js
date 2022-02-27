import axios from 'axios'

export default async (req, res) => {
  switch (req.method) {
    case 'GET': {
      axios.interceptors.request.use((config) => ({
        ...config,
        headers: {
          ...config.headers,
          Cookie: req.headers.cookie,
          'x-dm-version': '1.0.0',
          'Content-Type': 'application/json',
        },
      }))
      try {
        const points = (await axios.get(`${process.env.DM_URL}/collection/points`)).data
        res.writeHeader(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            points,
          })
        )
      } catch (e) {
        res.writeHeader(401)
        res.end()
      }
      break
    }
  }
}
