<template>
  <image
    v-if="options.x"
    ref="image"
    v-bind="options"
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

const interact = require('interactjs')

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
        src: null
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
          this.copyOptions(this.getOptionsFromDb())
          this.waitUntil(
            () => vm.$refs.image,
            () => {
              interact(vm.$refs.image)
                .draggable({
                  onmove: (event) => {
                    vm.options.x += event.dx / vm.zoom
                    vm.options.y += event.dy / vm.zoom
                  }
                })
                .resizable({
                  edges: { right: true, bottom: true }
                })
                .on('resizemove', (event) => {
                  vm.options.width = event.rect.width / vm.zoom
                  vm.options.height = event.rect.height / vm.zoom
                })
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
    getOptionsFromSvgGroup() {
      const image = Object.values(this.svgGroup.childNodes).find(
        (node) => node.nodeName === 'image'
      )
      return {
        x: parseFloat(image.getAttribute('x')),
        y: parseFloat(image.getAttribute('y')),
        width: parseFloat(image.getAttribute('width')),
        height: parseFloat(image.getAttribute('height')),
        fgColor: image.getAttribute('fgColor'),
        bgColor: image.getAttribute('bgColor'),
        font: image.getAttribute('font'),
        text: image.getAttribute('text'),
        rotation: parseFloat(image.getAttribute('rotation')),
        internalWidth: parseFloat(image.getAttribute('internalWidth')),
        'xlink:href': image.getAttribute('xlink:href')
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
          height,
          'xlink:href': vm.imageUrl
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
      vm.textImageOptions = vm.options
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

      vm.copyOptions({
        ...vm.options,
        'xlink:href': vm.imageUrl
      })
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
