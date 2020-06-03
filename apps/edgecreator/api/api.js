import axios from 'axios'

export default async function(req, res) {
  const { BACKEND_URL, EDGECREATOR_USER, EDGECREATOR_PASS } = process.env
  const auth = {
    username: EDGECREATOR_USER,
    password: EDGECREATOR_PASS
  }
  const response = await axios
    .get(`${BACKEND_URL}${req.url}`, {
      auth,
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
