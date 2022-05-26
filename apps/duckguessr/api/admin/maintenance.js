const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export default async (req, res) => {
  const query = (req._parsedOriginalUrl || { query: '' }).query || ''
  const {
    dataset: datasetName,
    decisions,
    offset,
  } = query
    .split('&')
    .reduce((acc, value) => ({ ...acc, [value.split('=')[0]]: value.split('=')[1] }), {})
  switch (req.method) {
    case 'GET': {
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      if (datasetName) {
        if (!decisions) {
          res.writeHeader(400, { 'Content-Type': 'application/text' })
          res.end()
          return
        }
        const dataset = await prisma.dataset.findUnique({
          where: {
            name: datasetName,
          },
        })
        const conditions = decisions.split(',').reduce(
          (acc, decision) => [
            ...acc,
            {
              dataset_id: dataset.id,
              entryurl_details: {
                is: {
                  decision: decision === 'null' ? null : decision,
                },
              },
            },
          ],
          []
        )
        res.end(
          JSON.stringify({
            entryurlsToMaintain: await prisma.dataset_entryurl.findMany({
              where: {
                OR: conditions,
              },
              include: {
                entryurl_details: true,
              },
              take: 60,
              skip: parseInt(offset),
            }),
          })
        )
      } else {
        res.end(
          JSON.stringify({
            datasets: await prisma.$queryRaw`
              select name, decision, count(*) as 'count'
              from dataset
              left join dataset_entryurl de on dataset.id = de.dataset_id
              left join entryurl_details using (sitecode_url)
              group by dataset_id, decision
            `,
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
