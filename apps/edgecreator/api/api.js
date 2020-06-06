import axios from 'axios'

export const addAxiosInterceptor = () => {
  axios.interceptors.request.use(function(config) {
    return {
      ...config,
      auth: {
        username: process.env.EDGECREATOR_USER,
        password: process.env.EDGECREATOR_PASS
      },
      headers: {
        ...config.headers,
        'x-dm-version': '1.0.0'
      }
    }
  })
}

addAxiosInterceptor()

export default async function(req, res) {
  const response = await axios
    .request({
      method: req.method,
      url: `${process.env.BACKEND_URL}${req.url}`,
      data: req.body,
      headers: req.headers
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e)
      res.statusCode = e.response.status
      res.end()
      throw e
    })

  if (response) {
    res.writeHeader(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(response.data))
  }
}
