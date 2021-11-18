import axios from 'axios'

export const addAxiosInterceptor = () => {
  axios.interceptors.request.use((config) => ({
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
  }))
}

export const getUserCredentials = (req) =>
  req.headers.cookie
    ? {
        'x-dm-user': req.headers.cookie.match(/(?<=dm-user=)[^;]+/)[0],
        'x-dm-pass': req.headers.cookie.match(/(?<=dm-pass=)[^;]+/)[0],
      }
    : null

export const getUserRoles = async (req) => {
  const privileges = await axios
    .get(`${process.env.BACKEND_URL}/collection/privileges`, {
      headers: getUserCredentials(req),
    })
    .catch((e) => {
      console.error(e)
      throw e
    })
  return [roleMapping[privileges.data.EdgeCreator] || 'display']
}

export const checkUserRoles = async (req, res, checkFn) => {
  try {
    const userRoles = await getUserRoles(req)
    if (!userRoles.length) {
      return false
    }
    if (!checkFn(userRoles)) {
      res.writeHeader(403)
      res.end('Forbidden')
      return false
    }
    return true
  } catch ({ response }) {
    res.writeHeader(response.status)
    res.end(response.statusText)
    return false
  }
}

export const returnError = (res, error) => {
  res.writeHeader(500, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      error: typeof error === 'object' ? JSON.stringify(error) : error,
    })
  )
}

const roleMapping = {
  Affichage: 'display',
  Edition: 'edit',
  Admin: 'admin',
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
