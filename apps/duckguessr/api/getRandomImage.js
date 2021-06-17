import axios from 'axios'

export const addAxiosInterceptor = () => {
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
}
addAxiosInterceptor()

export default async (req, res) => {
  const response = await axios
    .request({
      method: 'POST',
      url: `${process.env.BACKEND_URL}/rawsql`,
      data: {
        query: `
          select distinct
                          id, url,
                          person.personcode, person.nationalitycountrycode, person.fullname, plotwritartink,
                          regexp_replace(firstpublicationdate, '-.*', '') AS date
          from (
                 SELECT entrycode, url, storycode, id
                 FROM inducks_entryurl
                 WHERE id >= FLOOR(RAND() * (SELECT MAX(id) FROM inducks_entryurl))
                   AND sitecode = 'thumbnails3'
                 LIMIT 150
               ) as entryurl
          inner join inducks_entry entry on entry.entrycode = entryurl.entrycode
          inner join inducks_storyversion storyversion on entry.storyversioncode = storyversion.storyversioncode
          inner join inducks_story story on storyversion.storycode = story.storycode
          inner join inducks_storyjob storyjob on storyversion.storyversioncode = storyjob.storyversioncode
          inner join inducks_person person on storyjob.personcode = person.personcode
          where position like 'p%'
            and person.personcode <> '?'
            and person.nationalitycountrycode <> ''
          group by url
          limit 10
        `,
        db: 'coa',
      },
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
