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
const seriesUrls = [
  {
    url: ROOT_URL + 'serie-13738-BD-Recueil-Mickey-Le-Journal-de-1952.html',
    coa: {
      publicationcode: 'fr/ALJM'
    }
  },
  {
    url: ROOT_URL + 'serie-33826-BD-Albums-Roses-Hachette.html',
    coa: {
      publicationcode: 'fr/ARS',
      mapping: albumNum => {
        switch (albumNum) {
          case '2':return {issuenumber: '50-01'}
          case '1':return {issuenumber: '50-02'}
          case '6': return {issuenumber: '50-03'}
          case '4':return {issuenumber: '50-04'}
          case '5': return {issuenumber: '50-05'}
          case '3':return {issuenumber: '50-06'}
          case '9': return {issuenumber: '50-07'}
          case '7': return {issuenumber: '50-08'}
          case '8': return {issuenumber: '50-09'}
          case '10': return {issuenumber: '50-10'}
          case '12': return {issuenumber: '51-02'}
          case '23': return {issuenumber: '51-03'}
          case '17': return {issuenumber: '51-04'}
          case '19': return {issuenumber: '51-05'}
          case '14': return {issuenumber: '51-06'}
          case '13': return {issuenumber: '51-07'}
          case '15': return {issuenumber: '51-01'}
          case '16': return {issuenumber: '51-08'}
          case '21': return {issuenumber: '51-09'}
          case '26': return {issuenumber: '52-01'}
          case '27': return {issuenumber: '52-02'}
          case '33': return {issuenumber: '52-03'}
          case '32': return {issuenumber: '52-04'}
          case '35': return {issuenumber: '52-05'}
          case '34': return {issuenumber: '52-06'}
          case '41': return {issuenumber: '52-08'}
          case '52': return {issuenumber: '53-01'}
          case '51': return {issuenumber: '53-02'}
          case '56': return {issuenumber: '53-04'}
          case '71': return {issuenumber: '53-05'}
          case '88': return {issuenumber: '54-01'}
          case '76': return {issuenumber: '54-03'}
          case '77': return {issuenumber: '54-04'}
          case '103': return {issuenumber: '55-04'}
          case '115': return {issuenumber: '55-06'}
          case '114': return {issuenumber: '56-01'}
          case '120': return {issuenumber: '56-07'}
          case '121': return {issuenumber: '56-08'}
          case '123': return {issuenumber: '56-10'}
          case '135': return {issuenumber: '57-02'}
          case '140': return {issuenumber: '57-04'}
          case '142': return {issuenumber: '57-05'}
          case '144': return {issuenumber: '57-06'}
          case '173': return {issuenumber: '61-01'}
          case '189': return {issuenumber: '62-01'}
          case '196': return {issuenumber: '62-02'}
          case '207': return {issuenumber: '63-04'}
          case '213': return {issuenumber: '64-02'}
          case '215': return {issuenumber: '64-03'}
          case '218': return {issuenumber: '65-01'}
          case '220': return {issuenumber: '65-02'}
          case '221': return {issuenumber: '65-04'}
          case '217': return {issuenumber: '65-05'}
          case '222': return {issuenumber: '65-07'}
          case '225': return {issuenumber: '65-09'}
          case '252': return {issuenumber: '67-01'}
          case '256': return {issuenumber: '67-04'}
          case '257': return {issuenumber: '67-06'}
          case '293': return {issuenumber: '67-07'}
          case '284': return {issuenumber: '68-01'}
          case '275': return {issuenumber: '69-01'}
          // case '11': return {issuenumber: ''}
          // case '18': return {issuenumber: ''}
          // case '20': return {issuenumber: ''}
          // case '22': return {issuenumber: ''}
          // case '24': return {issuenumber: ''}
          // case '25': return {issuenumber: ''}
          // case '28': return {issuenumber: ''}
          // case '29': return {issuenumber: ''}
          // case '30': return {issuenumber: ''}
          // case '31': return {issuenumber: ''}
          // case '36': return {issuenumber: ''}
          // case '37': return {issuenumber: ''}
          // case '38': return {issuenumber: ''}
          // case '39': return {issuenumber: ''}
          // case '40': return {issuenumber: ''}
          // case '42': return {issuenumber: ''}
          // case '43': return {issuenumber: ''}
          // case '44': return {issuenumber: ''}
          // case '45': return {issuenumber: ''}
          // case '46': return {issuenumber: ''}
          // case '47': return {issuenumber: ''}
          // case '54': return {issuenumber: ''}
          // case '57': return {issuenumber: ''}
          // case '61': return {issuenumber: ''}
          // case '67': return {issuenumber: ''}
          // case '69': return {issuenumber: ''}
          // case '70': return {issuenumber: ''}
          // case '74': return {issuenumber: ''}
          // case '78': return {issuenumber: ''}
          // case '99': return {issuenumber: ''}
          // case '100': return {issuenumber: ''}
          // case '112': return {issuenumber: ''}
          // case '113': return {issuenumber: ''}
          // case '117': return {issuenumber: ''}
          // case '243': return {issuenumber: ''}
          // case '255': return {issuenumber: ''}
          // case '261': return {issuenumber: ''}
          // case '277': return {issuenumber: ''}
          // case '292': return {issuenumber: ''}
          // case '301': return {issuenumber: ''}
          // case '346': return {issuenumber: ''}
          // case '347': return {issuenumber: ''}
        }
      }
    }
  },
  {
    url: ROOT_URL + 'serie-1443-BD-Mickey.html',
    coa: {
      publicationcode: 'fr/GB',
      mapping: albumNum => {
        switch (albumNum) {
          case 'La fabuleuse histoire de Mickey': return {
              issuenumber: '1'
            }
          case 'Mickey 1930-1936': return {
              issuenumber: '9'
            }
          case '365 histoires de Mickey': return {
              issuenumber: '10'
            }
        }
      }
    }
  },
  {
    url: ROOT_URL + 'serie-12842-BD-Picsou-Magazine.html',
    coa: {
      publicationcode: 'fr/PM'
    }
  },
  {
    url: ROOT_URL + 'serie-11795-BD-Super-Picsou-Geant.html',
    coa: {
      publicationcode: 'fr/SPG'
    }
  },
  {
    url: ROOT_URL + 'serie-18476-BD-Super-Picsou-Geant-Suppl-Picsou-Magazine.html',
    coa: {
      publicationcode: 'fr/SPGP'
    }
  },
]

async function run() {
  let mappedIssues = []
  await readCsvMapping(record => mappedIssues.push(record))
  const seriesUrls = [...new Set(mappedIssues.map(({bedetheque_url}) => bedetheque_url))]
  for (const serieUrl of seriesUrls) {
    const cacheFileName = `${serieUrl}.json`
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
      const bedethequeAlbum = scrapeOutput.albums.find(({albumNum, albumTitle}) => albumNum === mappedIssue.bedetheque_num || albumTitle === mappedIssue.bedetheque_title)
      if (!bedethequeAlbum) {
        console.warn(`Issue not found in Bedetheque series "${serieUrl}": num=${mappedIssue.bedetheque_num}, title=${mappedIssue.bedetheque_title}`)
      }

    }
  //     const estimationData = issues.map(({albumNum, estimationEuros: estimation}) => {
  //       let publicationcode
  //       let issuenumber
  //       if (series.mapping) {
  //         const mappingResult = series.mapping(albumNum)
  //         publicationcode = mappingResult.publicationcode || publicationcode
  //         issuenumber = mappingResult.issuenumber || issuenumber
  //       } else {
  //         publicationcode = series.coa.publicationcode
  //         issuenumber = albumNum
  //       }
  //       return {
  //         publicationcode,
  //         issuenumber,
  //         estimation: estimation,
  //       };
  //     });
    }
}

run()
