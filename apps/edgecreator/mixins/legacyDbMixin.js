export default {
  methods: {
    async getOptionsFromDb(targetComponent, dbOptions) {
      switch (targetComponent) {
        case 'ArcCircleRender': {
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
        case 'FillRender': {
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
        case 'GradientRender': {
          return {
            x: parseFloat(dbOptions.Pos_x_debut),
            y: parseFloat(dbOptions.Pos_y_debut),
            width: parseFloat(dbOptions.Pos_x_fin - dbOptions.Pos_x_debut),
            height: parseFloat(dbOptions.Pos_y_fin - dbOptions.Pos_y_debut),
            fill: `#${dbOptions.Couleur}`,
            direction: dbOptions.Sens,
          }
        }
        case 'ImageRender': {
          const image = await this.$axios.$get(
            `/fs/base64?${this.country}/elements/${dbOptions.Source}`
          )
          const embeddedImageHeight =
            this.width * (image.dimensions.height / image.dimensions.width)
          const fromBottom = dbOptions.Position === 'bas'
          return {
            src: dbOptions.Source,
            x: parseFloat(dbOptions.Decalage_x || 0),
            y: parseFloat(
              fromBottom
                ? this.height - embeddedImageHeight - (dbOptions.Decalage_y || 0)
                : dbOptions.Decalage_y || 0
            ),
            width: parseFloat(dbOptions.Compression_x || 1) * this.width,
            height: parseFloat(dbOptions.Compression_y || 1) * embeddedImageHeight,
          }
        }
        case 'PolygonRender': {
          return {
            points: dbOptions.X.map((x, i) => [x, dbOptions.Y[i]]),
            fill: `#${dbOptions.Couleur}`,
          }
        }
        case 'RectangleRender': {
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
        case 'TextRender': {
          return {
            fgColor: dbOptions.Couleur_texte,
            bgColor: dbOptions.Couleur_fond,
            font: dbOptions.URL.replace(/\./g, '/'),
            text: dbOptions.Chaine,
            internalWidth: parseFloat(dbOptions.Largeur),
            rotation: 360 - parseFloat(dbOptions.Rotation),
            isHalfHeight: dbOptions.Demi_hauteur === 'Oui',
          }
        }
      }
    },
  },
}
