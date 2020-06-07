<template>
  <image ref="image" v-bind="options" @click="setStepNumber(stepNumber)">
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

  watch: {
    image(newValue) {
      if (newValue) {
        this.copyOptions(this.getOptionsFromDb())
      }
    }
  },

  async mounted() {
    if (this.dbOptions) {
      this.image = await this.$axios.$get(
        `/fs/base64?${this.edge.country}/elements/${this.options.src}`
      )
    }
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
        src: image.getAttribute('src'),
        'xlink:href': image.getAttribute('xlink:href')
      }
    },
    getOptionsFromDb() {
      if (!this.image.dimensions || !this.image.base64) {
        return {
          src: this.dbOptions.Source
        }
      }
      const embeddedImageHeight =
        this.width *
        (this.image.dimensions.height / this.image.dimensions.width)
      const fromBottom = this.dbOptions.Position === 'bas'
      return {
        ...this.options,
        x: parseFloat(this.dbOptions.Decalage_x),
        y: parseFloat(
          fromBottom
            ? this.height - embeddedImageHeight - this.dbOptions.Decalage_y
            : this.dbOptions.Decalage_y
        ),
        width: parseFloat(this.dbOptions.Compression_x) * this.width,
        height: parseFloat(this.dbOptions.Compression_y) * embeddedImageHeight,
        'xlink:href': this.image.url
      }
    }
  }
}
</script>

<style scoped></style>
