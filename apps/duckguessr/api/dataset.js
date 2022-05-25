const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export default async (req, res) => {
  switch (req.method) {
    case 'GET': {
      const datasets = await prisma.$queryRaw`
        SELECT name, title, COUNT(*) AS images, COUNT(DISTINCT personcode) AS authors
        FROM dataset
        LEFT JOIN dataset_entryurl de ON dataset.id = de.dataset_id
        LEFT JOIN entryurl_details entryurl ON de.sitecode_url = entryurl.sitecode_url
        WHERE dataset.name NOT LIKE '%-ml'
        AND decision = 'ok'
        GROUP BY dataset.name
      `
      res.writeHeader(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          datasets,
        })
      )
      break
    }
  }
}
