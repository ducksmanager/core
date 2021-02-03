const {Scraper} = require('bedetheque-scraper');
const parse = require('csv-parse');
const fs = require('fs')
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers')
const mariadb = require('mariadb');

for (const envKey of ['MYSQL_COA_HOST', 'MYSQL_COA_DATABASE', 'MYSQL_PASSWORD']) {
  if (!process.env[envKey]) {
    console.error(`Environment variable not found, aborting: ${envKey}`)
    process.exit(1)
  }
}

const coaPool = mariadb.createPool({
  host: process.env.MYSQL_COA_HOST,
  user: 'root',
  port: 64000,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_COA_DATABASE
});

const args = yargs(hideBin(process.argv)).argv

const MAPPING_FILE = 'inducks_mapping.csv'
const ROOT_URL = 'https://www.bedetheque.com/';

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

async function run(coaConnection) {
  let mappedIssues = []
  const cacheDir = args['cache-dir'] || 'cache';
  fs.mkdirSync(cacheDir, {recursive: true})

  await readCsvMapping(record => mappedIssues.push(record))
  const seriesUrls = [...new Set(mappedIssues.map(({bedetheque_url}) => bedetheque_url))]
  const cachedCoaIssues = {}
  await coaConnection.query("TRUNCATE inducks_issuequotation")

  for (const serieUrl of seriesUrls) {
    const cacheFileName = `${cacheDir}/${serieUrl}.json`
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
    for (const {bedetheque_num, bedetheque_title, publicationcode, issuenumber} of mappedIssuesForSeries) {
      cachedCoaIssues[publicationcode] = cachedCoaIssues[publicationcode]
        || (await coaConnection.query(
          "SELECT issuenumber FROM inducks_issue WHERE publicationcode=?",
          [publicationcode]
        )).map(({issuenumber}) => issuenumber)

      if (!cachedCoaIssues[publicationcode].length) {
        console.warn(` No issue found in COA for publication code ${publicationcode}`)
      } else if (!cachedCoaIssues[publicationcode].find(dbIssuenumber => dbIssuenumber === issuenumber)) {
        console.warn(` No issue found in COA for publication code ${publicationcode} and issue number ${issuenumber}`)
      } else {
        const bedethequeAlbum = scrapeOutput.albums.find(({albumNum, albumTitle}) =>
          !(
            (bedetheque_num !== '' && albumNum !== bedetheque_num) ||
            (bedetheque_title !== '' && albumTitle !== bedetheque_title)))
        if (!bedethequeAlbum) {
          console.warn(` No issue found in Bedetheque series "${serieUrl}": num=${bedetheque_num}, title=${bedetheque_title}`)
        } else {
          if (!bedethequeAlbum.estimationEuros) {
            bedethequeAlbum.estimationEuros = []
          }
          (await coaConnection.query(
            "INSERT INTO inducks_issuequotation(publicationcode, issuenumber, estimationmin, estimationmax, scrapedate) VALUES(?,?,?,?,?)",
            [
              publicationcode,
              issuenumber,
              bedethequeAlbum.estimationEuros[0] || null,
              bedethequeAlbum.estimationEuros[1] || null,
              fs.statSync(cacheFileName).mtime
            ]
          ))
        }
      }
    }
    console.log('Done')
  }
}

coaPool.getConnection()
  .then(async coaConnection => {
    await coaConnection.query(`
        CREATE TABLE IF NOT EXISTS inducks_issuequotation
        (
            publicationcode varchar(15) COLLATE utf8_unicode_ci NOT NULL,
            issuenumber     varchar(12) COLLATE utf8_unicode_ci NOT NULL,
            estimationmin   float DEFAULT NULL,
            estimationmax   float DEFAULT NULL,
            scrapedate      datetime                            NOT NULL,
            PRIMARY KEY (publicationcode, issuenumber)
        ) ENGINE = InnoDB
          DEFAULT CHARSET = utf8
          COLLATE = utf8_unicode_ci
    `)
    await run(coaConnection)
  }).catch(err => {
  console.error(err)
});
