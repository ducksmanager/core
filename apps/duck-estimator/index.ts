import { exec } from 'child_process'
import { mkdirSync } from 'fs'

import { getCacheDir } from './cache'
import { getAll,truncateQuotations } from './coa'
import { writeCsvMapping } from './csv'
const scrapes: Record<string, {scrape: () => Promise<unknown>}> = {
  // bedetheque: require('./scrapes/bedetheque'),
  // comicsmania: require('./scrapes/comicsmania'),
  // seriesam: require('./scrapes/seriesam'),
  gocollect: require('./scrapes/gocollect')
};

(async () => {
  await truncateQuotations()
  mkdirSync(getCacheDir(), { recursive: true })

  let hasFailed = false
  for (const scrapeName of Object.keys(scrapes)) {
    try {
      console.log(`Scraping ${scrapeName}, start date: ${new Date().toISOString()}`)
      await scrapes[scrapeName].scrape()
      console.log(`Scrape done, end date: ${new Date().toISOString()}`)
    } catch (e) {
      console.error('Scrape failed: ' + e)
      hasFailed = true
    }
  }

  if (hasFailed) {
    process.exit(1)
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

})()
