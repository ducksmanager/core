import { parse } from 'csv-parse'
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'
import { createReadStream } from 'fs'

import { inducks_issuequotation } from '~prisma-clients/schemas/coa'

export const readCsvMapping = async <CsvIssue> (mappingFile: string, recordCallback: (record: CsvIssue) => void) => {
  const parser = createReadStream(mappingFile)
    .pipe(parse({
      columns: true
    }))
  for await (const record of parser) {
    recordCallback(record)
  }
}
export const writeCsvMapping = async (data: inducks_issuequotation[]) => {
  const csvWriter = createCsvWriter({
    path: 'dump.csv',
    header: [
      { id: 'publicationcode', title: 'publicationcode' },
      { id: 'issuenumber', title: 'issuenumber' },
      { id: 'estimationmin', title: 'estimationmin' },
      { id: 'estimationmax', title: 'estimationmax' },
      { id: 'source', title: 'source' }
    ]
  })
  await csvWriter.writeRecords(data)
  console.log('CSV dumped')
}
