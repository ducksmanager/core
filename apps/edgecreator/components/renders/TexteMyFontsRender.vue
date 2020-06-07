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

const interact = require('../../node_modules/interact.js/interact')

export default {
  mixins: [stepOptionsMixin],

  data() {
    return {
      textImage: null,
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
    image(newValue) {
      if (newValue) {
        this.copyOptions(this.getOptionsFromDb())
      }
    },
    options: {
      deep: true,
      immediate: true,
      handler(newValue, oldValue) {
        if (
          (!oldValue && newValue.text) ||
          (oldValue && oldValue.text !== newValue.text)
        ) {
          this.refreshPreview()
        }
      }
    }
  },

  mounted() {
    const vm = this
    this.$root.$on('set-option', (optionName) => {
      switch (optionName) {
        case 'fgColor':
        case 'bgColor':
        case 'internalWidth':
        case 'text':
        case 'font':
          vm.refreshPreview()
      }
    })
  },

  methods: {
    onOptionsSet() {
      const vm = this
      interact(this.$refs.image)
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
        rotation: image.getAttribute('rotation'),
        internalWidth: parseFloat(image.getAttribute('internalWidth')),
        'xlink:href': image.getAttribute('xlink:href')
      }
    },
    getOptionsFromDb() {
      return {
        fgColor: this.dbOptions.Couleur_texte,
        bgColor: this.dbOptions.Couleur_fond,
        font: this.dbOptions.URL.replace(/\./g, '/'),
        text: this.dbOptions.Chaine,
        internalWidth: parseFloat(this.dbOptions.Largeur),
        rotation: 360 - parseFloat(this.dbOptions.Rotation),
        isHalfHeight: this.dbOptions.Demi_hauteur === 'Oui'
      }
    },
    async refreshPreview() {
      const vm = this
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

      if (vm.dbOptions) {
        const textImage = new Image()
        textImage.src = vm.imageUrl
        textImage.onload = function() {
          console.log(
            `${vm.width} * (${textImage.height} / ${textImage.width})= ` +
              vm.width * (textImage.height / textImage.width)
          )
          const embeddedImageHeight =
            vm.width * (textImage.height / textImage.width)
          const measureFromBottom = vm.dbOptions.Mesure_depuis_haut === 'Non'
          const width = parseFloat(vm.dbOptions.Compression_x) * vm.width
          const height =
            parseFloat(vm.dbOptions.Compression_y) * embeddedImageHeight

          const x = parseFloat(vm.dbOptions.Pos_x)
          const y =
            parseFloat(vm.dbOptions.Pos_y) - (measureFromBottom ? height : 0)

          vm.copyOptions({
            ...vm.options,
            x,
            y,
            width,
            height,
            'xlink:href': vm.imageUrl
          })
        }
      }
    }
  }
}
</script>

<style scoped></style>
