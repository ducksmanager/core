import axios from 'axios'

export default async function(req, res) {
  const response = await axios
    .get(`${process.env.BACKEND_URL}${req.url}`, {
      auth: {
        username: process.env.EDGECREATOR_USER,
        password: process.env.EDGECREATOR_PASS
      },
      headers: {
        ...req.headers,
        'x-dm-version': '1.0.0'
      }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e)
      res.statusCode = e.response.status
      res.end()
    })
  res.writeHeader(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(response.data))
}
