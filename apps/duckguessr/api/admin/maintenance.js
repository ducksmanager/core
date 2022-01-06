const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export default async (req, res) => {
  const { dataset } = (req._parsedOriginalUrl || { query: '' }).query
    .split('&')
    .reduce(
      (acc, value) => ({ ...acc, [value.split('=')[0]]: value.split('=')[1] }),
      {}
    )
  switch (req.method) {
    case 'GET': {
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          entryurlsToMaintain: (
            await prisma.$queryRaw`
              select sitecode_url as sitecodeUrl
              from datasets_entryurls de
              where dataset_id = (select id from datasets where name = ${dataset})
                and sitecode_url not in (
                select sitecode_url from entryurl_validations where sitecode_url = de.sitecode_url
              )
              limit 60
            `
          ).map(({ sitecodeUrl }) => sitecodeUrl),
          maintainedEntryurlsCount: await prisma.$queryRaw`
            select decision, count(*) as 'count'
            from datasets_entryurls de
            left join entryurl_validations ev on de.sitecode_url = ev.sitecode_url
            where dataset_id = (select id from datasets where name = ${dataset})
            group by decision
          `,
        })
      )
      break
    }
    case 'POST': {
      const { entryurlsPendingMaintenance, invalidSitecodeUrls } = req.body
      await prisma.entryurl_validations.createMany({
        data: entryurlsPendingMaintenance.map((sitecodeUrl) => ({
          sitecode_url: sitecodeUrl,
          decision: invalidSitecodeUrls.includes(sitecodeUrl),
          updated_at: new Date(),
        })),
      })
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end()
    }
  }
}
