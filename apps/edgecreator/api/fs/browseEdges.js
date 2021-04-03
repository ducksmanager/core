const fs = require('fs')
const path = require('path')

const edgePath = process.env.EDGES_PATH
const REGEX_IS_BROWSABLE_FILE = /^[-+(). _A-Za-z\d]+$/
const REGEX_IS_SVG_FILE = /^_?.+\.svg$/
let fileList

export default function (req, res) {
  fileList = {
    current: [],
    published: [],
  }
  findInDir(edgePath)
  res.writeHeader(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(fileList))
}

const findInDir = (dir) => {
  try {
    const files = fs.readdirSync(dir)
    files
      .filter((file) => REGEX_IS_BROWSABLE_FILE.test(file))
      .forEach((file) => {
        const filePath = path.join(dir, file)
        if (!file.includes('.')) {
          findInDir(filePath)
        } else if (REGEX_IS_SVG_FILE.test(file)) {
          const edgeStatus = file.indexOf('_') === 0 ? 'current' : 'published'
          fileList[edgeStatus].push(filePath.replace(edgePath, ''))
        }
      })
  } catch (e) {
    console.error(e)
  }
}
