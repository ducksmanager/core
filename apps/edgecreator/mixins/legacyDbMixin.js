import textTemplateMixin from '@/mixins/textTemplateMixin'

const componentToHex = (c) => {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}
const rgbToHex = (color) => {
  if (!color.includes(',')) {
    return `#${color}`
  }
  const [r, g, b] = color.split(/, ?/).map((component) => parseInt(component))
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

export default {
  mixins: [textTemplateMixin],
  methods: {
    getImageSize: (url) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = function () {
          resolve([img.width, img.height])
        }
        img.onerror = reject
      }),
    validateOptions(optionNames, options) {
      for (const requiredOption of optionNames) {
        if (options[requiredOption] === undefined) {
          throw new Error('Required option not found: ' + requiredOption)
        }
      }
    },
    async getOptionsFromDb(
      targetComponent,
      dbOptions,
      edgeDimensions,
      issuenumber,
      calculateBase64 = true
    ) {
      switch (targetComponent) {
        case 'ArcCircle': {
          this.validateOptions(
            ['Rempli', 'Pos_x_centre', 'Pos_y_centre', 'Largeur', 'Hauteur', 'Couleur'],
            dbOptions
          )
          const filled = dbOptions.Rempli === 'Oui'

          return {
            cx: parseFloat(dbOptions.Pos_x_centre),
            cy: parseFloat(dbOptions.Pos_y_centre),
            rx: parseFloat(dbOptions.Largeur) / 2,
            ry: parseFloat(dbOptions.Hauteur) / 2,
            fill: filled ? rgbToHex(dbOptions.Couleur) : 'transparent',
            stroke: filled ? 'transparent' : rgbToHex(dbOptions.Couleur),
          }
        }
        case 'Fill': {
          this.validateOptions(['Pos_x', 'Pos_y', 'Couleur'], dbOptions)
          if (parseFloat(dbOptions.Pos_x) !== 0) {
            console.error(`Step ${this.stepNumber}: Pos_x !== 0, this is not supported`)
          }
          if (parseFloat(dbOptions.Pos_y) !== 0) {
            console.error(`Step ${this.stepNumber}: Pos_y !== 0, this is not supported`)
          }
          return {
            fill: rgbToHex(dbOptions.Couleur),
          }
        }
        case 'Gradient': {
          this.validateOptions(
            [
              'Pos_x_debut',
              'Pos_y_debut',
              'Pos_x_fin',
              'Pos_y_fin',
              'Couleur_debut',
              'Couleur_fin',
              'Sens',
            ],
            dbOptions
          )
          return {
            x: parseFloat(dbOptions.Pos_x_debut),
            y: parseFloat(dbOptions.Pos_y_debut),
            width: parseFloat(dbOptions.Pos_x_fin - dbOptions.Pos_x_debut),
            height: parseFloat(dbOptions.Pos_y_fin - dbOptions.Pos_y_debut),
            colorStart: rgbToHex(dbOptions.Couleur_debut),
            colorEnd: rgbToHex(dbOptions.Couleur_fin),
            direction: dbOptions.Sens,
          }
        }
        case 'Image': {
          this.validateOptions(
            ['Source', 'Position', 'Decalage_x', 'Decalage_y', 'Compression_x', 'Compression_y'],
            dbOptions
          )
          let image
          try {
            const elementPath = `${this.country}/elements/${this.resolveStringTemplates(
              dbOptions.Source,
              {
                dimensions: edgeDimensions,
                issuenumber,
              }
            )}`

            if (calculateBase64) {
              image = await this.$axios.$get(`/fs/base64?${elementPath}`)
            } else {
              image = {
                dimensions: await this.getImageSize(`${process.env.EDGES_URL}/${elementPath}`),
              }
            }
          } catch (e) {
            console.error(`Image could not be retrieved : ${dbOptions.Source}`)
            return {
              x: 0,
              y: 0,
              width: 20,
              height: 20,
              src: dbOptions.Source,
            }
          }

          const embeddedImageHeight =
            edgeDimensions.width * (image.dimensions.height / image.dimensions.width)
          const fromBottom = dbOptions.Position === 'bas'
          return {
            src: dbOptions.Source,
            x: parseFloat(dbOptions.Decalage_x || 0),
            y: parseFloat(
              fromBottom
                ? edgeDimensions.height - embeddedImageHeight - (dbOptions.Decalage_y || 0)
                : dbOptions.Decalage_y || 0
            ),
            width: parseFloat(dbOptions.Compression_x || 1) * edgeDimensions.width,
            height: parseFloat(dbOptions.Compression_y || 1) * embeddedImageHeight,
          }
        }
        case 'Polygon': {
          this.validateOptions(['X', 'Y', 'Couleur'], dbOptions)
          const x = dbOptions.X.split(',')
          const y = dbOptions.Y.split(',')
          return {
            points: x.map((x, i) => [x, y[i]]),
            fill: rgbToHex(dbOptions.Couleur),
          }
        }
        case 'Rectangle': {
          this.validateOptions(
            ['Rempli', 'Pos_x_debut', 'Pos_y_debut', 'Pos_x_fin', 'Pos_y_fin', 'Couleur'],
            dbOptions
          )
          const filled = dbOptions.Rempli === 'Oui'
          return {
            x: parseFloat(dbOptions.Pos_x_debut),
            y: parseFloat(dbOptions.Pos_y_debut),
            width: parseFloat(dbOptions.Pos_x_fin - dbOptions.Pos_x_debut),
            height: parseFloat(dbOptions.Pos_y_fin - dbOptions.Pos_y_debut),
            fill: filled ? rgbToHex(dbOptions.Couleur) : 'transparent',
            stroke: filled ? 'transparent' : rgbToHex(dbOptions.Couleur),
          }
        }
        case 'Staple': {
          this.validateOptions(['Y1', 'Y2', 'Taille_agrafe'], dbOptions)
          return {
            y1: dbOptions.Y1,
            y2: dbOptions.Y2,
            height: dbOptions.Taille_agrafe,
          }
        }
        case 'Text': {
          this.validateOptions(
            [
              'Pos_x',
              'Pos_y',
              'Couleur_texte',
              'Couleur_fond',
              'Chaine',
              'Largeur',
              'Rotation',
              'Demi_hauteur',
              'Compression_x',
              'Compression_y',
            ],
            dbOptions
          )
          let legacyRotation = Math.round(parseFloat(dbOptions.Rotation))
          if (legacyRotation < 0) {
            legacyRotation += 360
          }
          return {
            x: parseInt(dbOptions.Pos_x),
            y: parseInt(dbOptions.Pos_y),
            fgColor: rgbToHex(dbOptions.Couleur_texte),
            bgColor: rgbToHex(dbOptions.Couleur_fond),
            font: dbOptions.URL.replace(/\./g, '/'),
            text: dbOptions.Chaine,
            internalWidth: parseFloat(dbOptions.Largeur),
            rotation: 360 - legacyRotation,
            isHalfHeight: dbOptions.Demi_hauteur === 'Oui',
            widthCompression: parseFloat(dbOptions.Compression_x || 1),
            heightCompression: parseFloat(dbOptions.Compression_y || 1),
          }
        }
      }
    },
  },
}
