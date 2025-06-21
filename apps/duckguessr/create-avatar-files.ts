const { renameSync } = require('fs')
const sharp = require('sharp')
const { avatars, avatarDiskDiameter } = require('./types/avatar')

const tree = sharp('static/Donald_Duck_Family_Tree.webp')

for (const { character, position } of avatars) {
  tree
    .extract({
      width: avatarDiskDiameter,
      height: avatarDiskDiameter,
      left: position[0] - avatarDiskDiameter / 2,
      top: position[1] - avatarDiskDiameter / 2,
    })
    .toFile(`static/avatars/${character}.png`)
    .then(() => {
      console.log(`Image cropped and saved`)
      const r = avatarDiskDiameter / 2
      const circleShape = Buffer.from(`<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`)

      sharp(`static/avatars/${character}.png`)
        .composite([
          {
            input: circleShape,
            blend: 'dest-in',
          },
        ])
        .toFile(`static/avatars/${character}_2.png`)
        .then(() => {
          renameSync(`static/avatars/${character}_2.png`, `static/avatars/${character}.png`)
        })
    })
    .catch((err: any) => {
      console.log(`An error occurred: ${err}`)
    })
}
