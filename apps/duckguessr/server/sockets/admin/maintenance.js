const { PrismaClient } = require('@prisma/client')
const game = require('../../../server/game')

const prisma = new PrismaClient()
exports.createMaintenanceSocket = (io) => {
  io.of('/admin/maintenance').on('connection', (socket) => {
    socket.on('get', async () => {
      let entryurlsToMaintain = []
      let minRow = 0
      const batch = 60
      let alreadyVerifiedCoaEntryUrls = null
      while (
        entryurlsToMaintain.length < batch &&
        (alreadyVerifiedCoaEntryUrls == null ||
          alreadyVerifiedCoaEntryUrls.length)
      ) {
        const coaEntryUrls = (
          await game.runQuery(game.getCOAEntryurlsQuery([minRow, batch]), 'coa')
        ).data.map(({ sitecode_url: sitecodeUrl }) => sitecodeUrl)
        alreadyVerifiedCoaEntryUrls = (
          await prisma.entryurl_validations.findMany({
            where: {
              sitecode_url: {
                in: coaEntryUrls,
              },
            },
          })
        ).map(({ sitecode_url: sitecodeUrl }) => sitecodeUrl)
        entryurlsToMaintain = [
          ...entryurlsToMaintain,
          ...coaEntryUrls.filter(
            (x) => !alreadyVerifiedCoaEntryUrls.includes(x)
          ),
        ]
        minRow += batch
      }
      const maintainedEntryurlsCount = await prisma.entryurl_validations.count({
        where: {
          decision: false,
        },
      })
      socket.emit('entryurlsPendingMaintenance', {
        entryurlsToMaintain: entryurlsToMaintain.map((sitecodeUrl) => ({
          sitecodeUrl,
        })),
        maintainedEntryurlsCount,
      })
    })

    socket.on(
      'postValidationsChoices',
      async ({ entryurlsPendingMaintenance, invalidSitecodeUrls }) => {
        await prisma.entryurl_validations.createMany({
          data: entryurlsPendingMaintenance.map(({ sitecodeUrl }) => ({
            sitecode_url: sitecodeUrl,
            decision: invalidSitecodeUrls.includes(sitecodeUrl),
            updated_at: new Date(),
          })),
        })
      }
    )
  })
}
