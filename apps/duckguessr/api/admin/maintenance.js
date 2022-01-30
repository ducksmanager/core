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
              from dataset_entryurl de
                     left join entryurl_validation using (sitecode_url)
              where dataset_id = (select id from dataset where name = ${dataset})
                and decision is null
              limit 60
            `,
            maintainedEntryurlsCount: await prisma.$queryRaw`
              select decision, count(*) as 'count'
              from dataset_entryurl de
                     left join entryurl_validation using (sitecode_url)
              where dataset_id = (select id from dataset where name = ${dataset})
              group by decision
            `,
          })
        )
      } else {
        res.end(
          JSON.stringify({
            datasets: await prisma.dataset.findMany(),
          })
        )
      }
      break
    }
    case 'POST': {
      const { entryurlsPendingMaintenance } = req.body
      await prisma.entryurl_validation.createMany({
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
