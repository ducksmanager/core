const {Scraper} = require('bedetheque-scraper');
const parse = require('csv-parse');
const fs = require('fs')

const MAPPING_FILE='inducks_mapping.csv'

const readCsvMapping = async (recordCallback) => {
  const parser = fs
    .createReadStream(MAPPING_FILE)
    .pipe(parse({
      columns: true
    }));
  for await (const record of parser) {
    recordCallback(record)
  }
}

const ROOT_URL = 'https://www.bedetheque.com/';

async function run() {
  let mappedIssues = []
  await readCsvMapping(record => mappedIssues.push(record))
  const seriesUrls = [...new Set(mappedIssues.map(({bedetheque_url}) => bedetheque_url))]
  for (const serieUrl of seriesUrls) {
    const cacheFileName = `cache/${serieUrl}.json`
    console.log(serieUrl)
    let scrapeOutput
    if (fs.existsSync(cacheFileName)) {
      console.log(' Data exists in cache')
      scrapeOutput = JSON.parse(fs.readFileSync(cacheFileName))
    } else {
      scrapeOutput = await Scraper.getSerie(ROOT_URL + serieUrl);
      fs.writeFileSync(cacheFileName, JSON.stringify(scrapeOutput))
    }
    const mappedIssuesForSeries = mappedIssues.filter(({bedetheque_url}) => bedetheque_url === serieUrl)
    for (const mappedIssue of mappedIssuesForSeries) {
      const bedethequeAlbum = scrapeOutput.albums.find(({albumNum, albumTitle}) =>
        !(
          (mappedIssue.bedetheque_num !== '' && albumNum !== mappedIssue.bedetheque_num) ||
          (mappedIssue.bedetheque_title !== '' && albumTitle !== mappedIssue.bedetheque_title)))
      if (!bedethequeAlbum) {
        console.warn(`Issue not found in Bedetheque series "${serieUrl}": num=${mappedIssue.bedetheque_num}, title=${mappedIssue.bedetheque_title}`)
      }
    }
    console.log('Done')
    }
}

run()
