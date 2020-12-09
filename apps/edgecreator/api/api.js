import axios from 'axios'

export const addAxiosInterceptor = () => {
  axios.interceptors.request.use((config) => {
    return {
      ...config,
      auth: {
        username: /\/collection/.test(config.url)
          ? process.env.DUCKSMANAGER_USER
          : process.env.EDGECREATOR_USER,
        password: /\/collection/.test(config.url)
          ? process.env.DUCKSMANAGER_PASS
          : process.env.EDGECREATOR_PASS,
      },
      headers: {
        ...config.headers,
        'x-dm-version': '1.0.0',
        'Content-Type': 'application/json',
      },
    }
  })
}

addAxiosInterceptor()

export default async (req, res) => {
  const response = await axios
    .request({
      method: req.method,
      url: `${process.env.BACKEND_URL}${req.url}`,
      data: req.body,
      headers: req.headers,
    })
    .catch((e) => {
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
