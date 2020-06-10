<template>
  <image
    v-if="options.x"
    ref="image"
    v-bind="options"
    :xlink:href="imageUrl"
    :transform="
      `rotate(${options.rotation}, ${options.x +
        options.width / 2}, ${options.y + options.height / 2})`
    "
    @click="setStepNumber(stepNumber)"
  >
    <metadata>{{ options }}</metadata>
  </image>
</template>

<script>
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
        rotation: 0
      }
    }
  },

  computed: {
    imageUrl() {
      return this.textImage
        ? `${process.env.EDGES_URL}/images_myfonts/${this.textImage.imageId}.png`
        : ''
    }
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
      }
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
    }
  },

  methods: {
    async onOptionsSet() {
      const vm = this

      await vm.refreshPreview()
      if (vm.dbOptions) {
        vm.copyOptions(await vm.getOptionsFromDb())
      }
    },
    async getOptionsFromDb() {
      const vm = this
      if (this.imageUrl) {
        const textImage = new Image()
        textImage.src = vm.imageUrl
        await new Promise(function(resolve) {
          const interval = setInterval(function() {
            if (textImage.width) {
              clearInterval(interval)
              resolve()
            }
          }, 10)
        })

        const embeddedImageHeight =
          vm.width * (textImage.height / textImage.width)
        const measureFromBottom = vm.dbOptions.Mesure_depuis_haut === 'Non'

        const width = parseFloat(vm.dbOptions.Compression_x) * vm.width
        const height =
          parseFloat(vm.dbOptions.Compression_y) * embeddedImageHeight

        const x = parseFloat(vm.dbOptions.Pos_x)
        const y =
          parseFloat(vm.dbOptions.Pos_y) - (measureFromBottom ? height : 0)

        return {
          ...vm.options,
          x,
          y,
          width,
          height
        }
      }
      return {
        fgColor: vm.dbOptions.Couleur_texte,
        bgColor: vm.dbOptions.Couleur_fond,
        font: vm.dbOptions.URL.replace(/\./g, '/'),
        text: vm.dbOptions.Chaine,
        internalWidth: parseFloat(vm.dbOptions.Largeur),
        rotation: 360 - parseFloat(vm.dbOptions.Rotation),
        isHalfHeight: vm.dbOptions.Demi_hauteur === 'Oui'
      }
    },

    async refreshPreview() {
      const vm = this
      if (JSON.stringify(vm.textImageOptions) === JSON.stringify(vm.options)) {
        return
      }
      vm.textImageOptions = { ...vm.options }
      const { fgColor, bgColor, internalWidth, text, font } = vm.options
      vm.textImage = await vm.$axios.$get(
        `/fs/text/${[
          fgColor,
          bgColor,
          internalWidth,
          'font',
          font,
          'text',
          text
        ].join('/')}`,
        {
          headers: {
            imageWidth: vm.edge.width,
            'Content-Type': 'application/json'
          }
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
    }
  }
}
</script>

<style scoped></style>
