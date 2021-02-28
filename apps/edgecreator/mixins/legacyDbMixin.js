export default {
  methods: {
    async getOptionsFromDb(targetComponent, dbOptions, edgeDimensions) {
      switch (targetComponent) {
        case 'ArcCircle': {
          const filled = dbOptions.Rempli === 'Oui'

          return {
            cx: parseFloat(dbOptions.Pos_x_centre),
            cy: parseFloat(dbOptions.Pos_y_centre),
            rx: parseFloat(dbOptions.Largeur) / 2,
            ry: parseFloat(dbOptions.Hauteur) / 2,
            fill: filled ? `#${dbOptions.Couleur}` : 'transparent',
            stroke: filled ? 'transparent' : `#${dbOptions.Couleur}`,
          }
        }
        case 'Fill': {
          if (parseFloat(dbOptions.Pos_x) !== 0) {
            console.error(`Step ${this.stepNumber}: Pos_x !== 0, this is not supported`)
          }
          if (parseFloat(dbOptions.Pos_y) !== 0) {
            console.error(`Step ${this.stepNumber}: Pos_y !== 0, this is not supported`)
          }
          return {
            fill: `#${dbOptions.Couleur}`,
          }
        }
        case 'Gradient': {
          return {
            x: parseFloat(dbOptions.Pos_x_debut),
            y: parseFloat(dbOptions.Pos_y_debut),
            width: parseFloat(dbOptions.Pos_x_fin - dbOptions.Pos_x_debut),
            height: parseFloat(dbOptions.Pos_y_fin - dbOptions.Pos_y_debut),
            colorStart: `#${dbOptions.Couleur_debut}`,
            colorEnd: `#${dbOptions.Couleur_fin}`,
            direction: dbOptions.Sens,
          }
        }
        case 'Image': {
          let image
          try {
            image = await this.$axios.$get(
              `/fs/base64?${this.country}/elements/${dbOptions.Source}`
            )
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
          return {
            points: dbOptions.X.map((x, i) => [x, dbOptions.Y[i]]),
            fill: `#${dbOptions.Couleur}`,
          }
        }
        case 'Rectangle': {
          const filled = dbOptions.Rempli === 'Oui'
          return {
            x: parseFloat(dbOptions.Pos_x_debut),
            y: parseFloat(dbOptions.Pos_y_debut),
            width: parseFloat(dbOptions.Pos_x_fin - dbOptions.Pos_x_debut),
            height: parseFloat(dbOptions.Pos_y_fin - dbOptions.Pos_y_debut),
            fill: filled ? `#${dbOptions.Couleur}` : 'transparent',
            stroke: filled ? 'transparent' : `#${dbOptions.Couleur}`,
          }
        }
        case 'Text': {
          return {
            x: parseInt(dbOptions.Pos_x),
            y: parseInt(dbOptions.Pos_y),
            fgColor: `#${dbOptions.Couleur_texte}`,
            bgColor: `#${dbOptions.Couleur_fond}`,
            font: dbOptions.URL.replace(/\./g, '/'),
            text: dbOptions.Chaine,
            internalWidth: parseFloat(dbOptions.Largeur),
            rotation: 360 - Math.round(parseFloat(dbOptions.Rotation)),
            isHalfHeight: dbOptions.Demi_hauteur === 'Oui',
            widthCompression: parseFloat(dbOptions.Compression_x || 1),
            heightCompression: parseFloat(dbOptions.Compression_y || 1),
          }
        }
      }
    },
  },
}
