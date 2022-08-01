const fs = require('fs')
const { connect: dbConnect, disconnect: dbDisconnect, truncateQuotations, getAll } = require('./coa')
const { getCacheDir } = require('./cache')
const { writeCsvMapping } = require('./csv')
const { exec } = require('child_process')

const scrapes = {
  bedetheque: require('./scrapes/bedetheque'),
  comicsmania: require('./scrapes/comicsmania'),
  seriesam: require('./scrapes/seriesam'),
  gocollect: require('./scrapes/gocollect')
}
dbConnect().then(async () => {
  await truncateQuotations()
  fs.mkdirSync(getCacheDir(), { recursive: true })

  for (const scrapeName of Object.keys(scrapes)) {
    try {
      console.log(`Scraping ${scrapeName}, start date: ${new Date().toISOString()}`)
      await scrapes[scrapeName].scrape()
      console.log(`Scrape done, end date: ${new Date().toISOString()}`)
    } catch (e) {
      console.error('Scrape failed: ' + e)
    }
  }

  await writeCsvMapping(await getAll())
  exec('sh bump-dump.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`)
      process.exit(1)
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`)
      process.exit(0)
    }
    console.log(`stdout: ${stdout}`)
    process.exit(0)
  })

  await dbDisconnect()
})
