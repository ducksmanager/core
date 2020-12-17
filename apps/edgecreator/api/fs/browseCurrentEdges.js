const fs = require('fs')
const path = require('path')

const edgePath = process.env.EDGES_PATH
const REGEX_IS_BROWSABLE_FILE = /^[-+(). _A-Za-z\d]+$/
const REGEX_IS_SVG_FILE = /\.svg$/
let fileList

export default function (req, res) {
  fileList = []
  const svgFiles = findInDir(edgePath)
  res.writeHeader(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(svgFiles))
}

const findInDir = (dir) => {
  const files = fs.readdirSync(dir)
  files
    .filter((file) => REGEX_IS_BROWSABLE_FILE.test(file))
    .forEach((file) => {
      const filePath = path.join(dir, file)
      if (REGEX_IS_SVG_FILE.test(filePath)) {
        fileList.push(filePath.replace(edgePath, ''))
      } else {
        const fileStat = fs.lstatSync(filePath)
        if (fileStat.isDirectory()) {
          findInDir(filePath)
        }
      }
    })
}
