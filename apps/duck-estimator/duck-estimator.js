const fs = require('fs')
const {connect: dbConnect, disconnect: dbDisconnect, truncateQuotations } = require('./coa')
const {getCacheDir } = require('./cache')

const bedethequeScrape = require('./scrapes/bedetheque')
const comicsmaniaScrape = require('./scrapes/comicsmania')

dbConnect().then(async () => {
  await truncateQuotations()
  fs.mkdirSync(getCacheDir(), {recursive: true})

  for (const scrape of [bedethequeScrape, comicsmaniaScrape]) {
    await scrape.scrape()
    console.log('Scrape done')
  }

  await dbDisconnect()
})
