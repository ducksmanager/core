const { renameSync } = require('fs')

const sharp = require('sharp')

const diskDiameter = 102

const avatars = {
  Huey: [206, 89],
  Duey: [331, 89],
  Louie: [457, 90],
  "HDL's father": [229, 232],
  'Della Duck': [396, 232],
  DD: [514, 235],
  GL: [667, 234],
  FE: [818, 236],
  GU: [1143, 238],
  'Matilda McDuck': [92, 372],
  US: [207, 371],
  'Hortense McDuck': [317, 370],
}

const tree = sharp('assets/Donald_Duck_Family_Tree.webp')

for (const [name, coordinates] of Object.entries(avatars)) {
  tree
    .extract({
      width: diskDiameter,
      height: diskDiameter,
      left: coordinates[0] - diskDiameter / 2,
      top: coordinates[1] - diskDiameter / 2,
    })
    .toFile(`static/avatars/${name}.png`)
    .then(() => {
      console.log(`Image cropped and saved`)
      const r = diskDiameter / 2
      const circleShape = Buffer.from(`<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`)

      sharp(`static/avatars/${name}.png`)
        .composite([
          {
            input: circleShape,
            blend: 'dest-in',
          },
        ])
        .toFile(`static/avatars/${name}_2.png`)
        .then(() => {
          renameSync(`static/avatars/${name}_2.png`, `static/avatars/${name}.png`)
        })
    })
    .catch((err) => {
      console.log(`An error occurred: ${err}`)
    })
}
