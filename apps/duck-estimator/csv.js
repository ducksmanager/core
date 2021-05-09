const fs = require('fs')
const csvParse = require('csv-parse')
const {createObjectCsvWriter: createCsvWriter} = require('csv-writer')

module.exports = {
  readCsvMapping: async (mappingFile, recordCallback) => {
    const parser = fs
      .createReadStream(mappingFile)
      .pipe(csvParse({
        columns: true
      }))
    for await (const record of parser) {
      recordCallback(record)
    }
  },

  writeCsvMapping: async (data) => {
    const csvWriter = createCsvWriter({
      path: 'dump.csv',
      header: [
        {id: 'publicationcode', title: 'publicationcode'},
        {id: 'issuenumber', title: 'issuenumber'},
        {id: 'estimationmin', title: 'estimationmin'},
        {id: 'estimationmax', title: 'estimationmax'},
        {id: 'source', title: 'source'},
      ]
    });
    await csvWriter.writeRecords(data)
    console.log('CSV dumped');
  }
}