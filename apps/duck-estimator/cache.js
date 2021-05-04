const fs = require('fs')
const yargs = require('yargs')
const {hideBin} = require('yargs/helpers')

const args = yargs(hideBin(process.argv)).argv

const getCacheDir = () => args['cache-dir'] || 'cache'

module.exports = {
  getCacheDir,

  syncScrapeCache: async (scrapeDirName, fileName, url, fetchFn, postGetFromCacheTransformFn, preSetInCacheTransformFn) => {
    const cacheFileName = `${getCacheDir()}/${scrapeDirName}/${fileName}`
    console.log(url)
    let scrapeOutput
    if (fs.existsSync(cacheFileName)) {
      console.debug(' Data exists in cache')
      scrapeOutput = postGetFromCacheTransformFn(fs.readFileSync(cacheFileName))
    } else {
      scrapeOutput = await fetchFn(url)
      fs.writeFileSync(cacheFileName, preSetInCacheTransformFn(scrapeOutput))
    }
    return scrapeOutput
  },

  getScrapeCacheTime: (scrapeDirName, fileName) =>
    fs.statSync(`${getCacheDir()}/${scrapeDirName}/${fileName}`).mtime
}
