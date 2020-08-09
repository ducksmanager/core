const fs = require('fs')
const path = require('path')

const edgePath = process.env.EDGES_PATH

export default function (req, res) {
  const svgs = findInDir(edgePath, /\/_[^/]+\.svg$/)
  res.writeHeader(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(svgs))
}

const findInDir = (dir, filter, fileList = []) => {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
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
