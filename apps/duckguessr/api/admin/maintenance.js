const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export default async (req, res) => {
  const query = (req._parsedOriginalUrl || { query: '' }).query || ''
  const { dataset } = query
    .split('&')
    .reduce(
      (acc, value) => ({ ...acc, [value.split('=')[0]]: value.split('=')[1] }),
      {}
    )
  switch (req.method) {
    case 'GET': {
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      if (dataset) {
        res.end(
          JSON.stringify({
            entryurlsToMaintain: await prisma.$queryRaw`
              select sitecode_url as sitecodeUrl, decision
              from datasets_entryurls de
                     left join entryurl_validations using (sitecode_url)
              where dataset_id = (select id from datasets where name = ${dataset})
                and decision is null
              limit 60
            `,
            maintainedEntryurlsCount: await prisma.$queryRaw`
              select decision, count(*) as 'count'
              from datasets_entryurls de
                     left join entryurl_validations using (sitecode_url)
              where dataset_id = (select id from datasets where name = ${dataset})
              group by decision
            `,
          })
        )
      } else {
        res.end(
          JSON.stringify({
            datasets: await prisma.datasets.findMany(),
          })
        )
      }
      break
    }
    case 'POST': {
      const { entryurlsPendingMaintenance } = req.body
      await prisma.entryurl_validations.createMany({
        data: entryurlsPendingMaintenance.map(({ sitecodeUrl, decision }) => ({
          sitecode_url: sitecodeUrl,
          decision,
          updated_at: new Date(),
        })),
      })
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end()
    }
  }
}
