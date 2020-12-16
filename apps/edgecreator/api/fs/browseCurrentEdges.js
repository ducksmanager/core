const fs = require('fs')
const path = require('path')

const edgePath = process.env.EDGES_PATH
const REGEX_IS_BROWSABLE_FILE = /^[-+(). _A-Za-z\d]+$/
const REGEX_IS_SVG_FILE = /\/_[^/]+\.svg$/

export default function (req, res) {
  const svgFiles = findInDir(edgePath, REGEX_IS_SVG_FILE)
  res.writeHeader(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(svgFiles))
}

const findInDir = (dir, filter, fileList = []) => {
  const files = fs.readdirSync(dir)
  files
    .filter((file) => REGEX_IS_BROWSABLE_FILE.test(file))
    .forEach((file) => {
      const filePath = path.join(dir, file)
      const fileStat = fs.lstatSync(filePath)

      if (fileStat.isDirectory()) {
        findInDir(filePath, filter, fileList)
      } else if (filter.test(filePath)) {
        fileList.push(filePath.replace(edgePath, ''))
      }
    })

  return fileList
}
