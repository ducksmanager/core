const axios = require('axios')

exports.runQuery = async (query, db, parameters = []) => {
  axios.interceptors.request.use((config) => ({
    ...config,
    auth: {
      username: process.env.RAWSQL_USER,
      password: process.env.RAWSQL_PASS,
    },
    headers: {
      ...config.headers,
      'x-dm-version': '1.0.0',
      'Content-Type': 'application/json',
    },
  }))
  return await axios
    .post(`${process.env.BACKEND_URL}/rawsql`, {
      query,
      db,
      parameters,
    })
    .catch((e) => {
      console.error(e)
      throw e
    })
}
