const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export default async (req, res) => {
  const query = (req._parsedOriginalUrl || { query: '' }).query || ''
  const { dataset: datasetName } = query
    .split('&')
    .reduce(
      (acc, value) => ({ ...acc, [value.split('=')[0]]: value.split('=')[1] }),
      {}
    )
  switch (req.method) {
    case 'GET': {
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      if (datasetName) {
        const dataset = await prisma.dataset.findUnique({
          where: {
            name: datasetName,
          },
        })
        res.end(
          JSON.stringify({
            entryurlsToMaintain: await prisma.dataset_entryurl.findMany({
              where: {
                dataset_id: dataset.id,
                entryurl_details: {
                  is: {
                    decision: null,
                  },
                },
              },
              include: {
                entryurl_details: true,
              },
              take: 60,
            }),
            maintainedEntryurlsCount: await prisma.$queryRaw`
              select decision, count(*) as 'count'
              from dataset_entryurl de
                     left join entryurl_details using (sitecode_url)
              where dataset_id = ${dataset.id}
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
      await prisma.$transaction(
        entryurlsPendingMaintenance.map(({ sitecode_url, decision }) =>
          prisma.entryurl_details.update({
            where: {
              sitecode_url,
            },
            data: {
              decision,
              updated_at: new Date(),
            },
          })
        )
      )
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end()
    }
  }
}
