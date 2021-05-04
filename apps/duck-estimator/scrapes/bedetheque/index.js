const fs = require('fs')
const {Scraper} = require('bedetheque-scraper')
const parse = require('csv-parse')
const { createQuotation, isInducksIssueExisting } = require('../../coa')
const { syncScrapeCache, getScrapeCacheTime } = require('../../cache')

const MAPPING_FILE = 'scrapes/bedetheque/bedetheque_mapping.csv'
const ROOT_URL = 'https://www.bedetheque.com/'

const readCsvMapping = async (recordCallback) => {
  const parser = fs
    .createReadStream(MAPPING_FILE)
    .pipe(parse({
      columns: true
    }))
  for await (const record of parser) {
    recordCallback(record)
  }
}

module.exports = {
  async scrape() {
    const mappedIssues = []

    await readCsvMapping(record => mappedIssues.push(record))
    const seriesUrls = [...new Set(mappedIssues.map(({bedetheque_url}) => bedetheque_url))]

    for (const serieUrl of seriesUrls) {
      const scrapeOutput = await syncScrapeCache(
        'bedetheque',
        `${serieUrl}.json`,
        ROOT_URL + serieUrl,
        async (url) => await Scraper.getSerie(url),
        contents => JSON.parse(contents),
        contents => JSON.stringify(contents)
      )
      const mappedIssuesForSeries = mappedIssues.filter(({bedetheque_url}) => bedetheque_url === serieUrl)
      for (const {bedetheque_num, bedetheque_title, publicationcode, issuenumber} of mappedIssuesForSeries) {
        if (await isInducksIssueExisting(publicationcode, issuenumber)) {
          const bedethequeAlbum = scrapeOutput.albums.find(({albumNum, albumTitle}) =>
            !(
              (bedetheque_num !== '' && albumNum !== bedetheque_num) ||
              (bedetheque_title !== '' && albumTitle !== bedetheque_title)))
          if (!bedethequeAlbum) {
            console.warn(` No issue found in Bedetheque series "${serieUrl}": num=${bedetheque_num}, title=${bedetheque_title}`)
          } else {
            let {estimationEuros} = bedethequeAlbum
            if (!estimationEuros) {
              estimationEuros = []
            }
            await createQuotation(
              publicationcode,
              issuenumber,
              estimationEuros[0] || null,
              estimationEuros[1] || null,
              getScrapeCacheTime('bedetheque', `${serieUrl}.json`)
            )
          }
        }
      }
      console.log('Done')
    }
    console.log('Done for all')
  }
}