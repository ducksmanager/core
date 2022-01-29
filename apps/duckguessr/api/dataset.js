const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

export default async (req, res) => {
  switch (req.method) {
    case 'GET': {
      const datasets = await prisma.$queryRaw`
        SELECT name, title, COUNT(*) AS images, COUNT(DISTINCT personcode) AS authors
        FROM datasets
               LEFT JOIN datasets_entryurls de ON datasets.id = de.dataset_id
        WHERE datasets.name NOT LIKE '%-ml'
        GROUP BY datasets.name
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
