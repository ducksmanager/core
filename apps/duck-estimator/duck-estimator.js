const fs = require('fs')
const {connect: dbConnect, disconnect: dbDisconnect, truncateQuotations, getAll } = require('./coa')
const {getCacheDir } = require('./cache')
const {writeCsvMapping } = require('./csv')
const { exec } = require("child_process");

const scrapes = {
  bedetheque: require('./scrapes/bedetheque'),
  comicsmania: require('./scrapes/comicsmania'),
  seriesam: require('./scrapes/seriesam')
}
dbConnect().then(async () => {
  await truncateQuotations()
  fs.mkdirSync(getCacheDir(), {recursive: true})

  for (const scrapeName of Object.keys(scrapes)) {
    try {
      console.log(`Scraping ${scrapeName}`)
      await scrapes[scrapeName].scrape()
      console.log('Scrape done')
    }
    catch(e) {
      console.error('Scrape failed: ' + e)
    }
  }

  await writeCsvMapping(await getAll())
  exec("sh bump-dump.sh", (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  await dbDisconnect()
})
