const fs = require('fs')

export default function(req, res) {
  const { issueNumber, content } = req.body
  fs.writeFile(`static/${issueNumber}.svg`, content, function() {
    res.end()
  })
}
