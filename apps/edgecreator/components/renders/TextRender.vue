<template>
  <image
    v-if="options.x !== undefined"
    ref="image"
    v-bind="options"
    :xlink:href="imageUrl"
    :transform="`rotate(${options.rotation}, ${options.x + options.width / 2}, ${
      options.y + options.height / 2
    })`"
  >
    <metadata>{{ options }}</metadata>
  </image>
</template>

<script>
import { mapState } from 'vuex'
import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  data() {
    return {
      textImage: null,
      textImageOptions: {},
      image: { base64: null, width: null, height: null },
      options: {
        x: 5,
        y: 5,
        width: 15,
        height: 15,
        src: null,
        rotation: 0,
      },
    }
  },

  computed: {
    imageUrl() {
      return this.textImage
        ? `${process.env.EDGES_URL}/images_myfonts/${this.textImage.imageId}.png`
        : ''
    },
    ...mapState(['width']),
  },

  watch: {
    image: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const vm = this
          if (vm.dbOptions) {
            this.copyOptions(this.getOptionsFromDb())
          }
          this.waitUntil(
            () => vm.$refs.image,
            () => {
              vm.enableDragResize(vm.$refs.image)
            },
            2000,
            100
          )
        }
      },
    },
    'options.fgColor'() {
      this.refreshPreview()
    },
    'options.bgColor'() {
      this.refreshPreview()
    },
    'options.internalWidth'() {
      this.refreshPreview()
    },
    'options.text'() {
      this.refreshPreview()
    },
    'options.font'() {
      this.refreshPreview()
    },
  },

  methods: {
    async onOptionsSet() {
      await this.refreshPreview()
      if (this.dbOptions) {
        this.copyOptions(await this.getOptionsFromDb())
      }
    },
    async getOptionsFromDb() {
      if (this.imageUrl) {
        const textImage = new Image()
        textImage.src = this.imageUrl
        await new Promise(function (resolve) {
          const interval = setInterval(function () {
            if (textImage.width) {
              clearInterval(interval)
              resolve()
            }
          }, 10)
        })

        const embeddedImageHeight = this.width * (textImage.height / textImage.width)
        const measureFromBottom = this.dbOptions.Mesure_depuis_haut === 'Non'

        const width = parseFloat(this.dbOptions.Compression_x) * this.width
        const height = parseFloat(this.dbOptions.Compression_y) * embeddedImageHeight

        const x = parseFloat(this.dbOptions.Pos_x)
        const y = parseFloat(this.dbOptions.Pos_y) - (measureFromBottom ? height : 0)

        return {
          ...this.options,
          x,
          y,
          width,
          height,
        }
      }
      return {
        fgColor: this.dbOptions.Couleur_texte,
        bgColor: this.dbOptions.Couleur_fond,
        font: this.dbOptions.URL.replace(/\./g, '/'),
        text: this.dbOptions.Chaine,
        internalWidth: parseFloat(this.dbOptions.Largeur),
        rotation: 360 - parseFloat(this.dbOptions.Rotation),
        isHalfHeight: this.dbOptions.Demi_hauteur === 'Oui',
      }
    },

    async refreshPreview() {
      if (JSON.stringify(this.textImageOptions) === JSON.stringify(this.options)) {
        return
      }
      this.textImageOptions = { ...this.options }
      const { fgColor, bgColor, internalWidth, text, font } = this.options
      this.textImage = await this.$axios.$get(
        `/fs/text/${[fgColor, bgColor, internalWidth, 'font', font, 'text', text].join('/')}`,
        {
          headers: {
            imageWidth: this.width,
            'Content-Type': 'application/json',
          },
        }
      )
    },
    waitUntil(condition, okCallback, timeout, loopEvery) {
      let iterations = 0
      const interval = setInterval(() => {
        if (condition()) {
          okCallback()
          clearInterval(interval)
        }
        if (++iterations > timeout / loopEvery) {
          clearInterval(interval)
        }
      }, loopEvery)
    },
  },
}
</script>

<style scoped></style>
