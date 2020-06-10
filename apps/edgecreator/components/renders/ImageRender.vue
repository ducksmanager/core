<template>
  <image
    ref="image"
    v-bind="options"
    :xlink:href="image.url"
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

  methods: {
    async onOptionsSet() {
      if (this.dbOptions) {
        this.image = await this.$axios.$get(
          `/fs/base64?${this.edge.country}/elements/${this.options.src}`
        )
        this.copyOptions(await this.getOptionsFromDb())
      }

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
    async getOptionsFromDb() {
      const vm = this
      if (!vm.image.dimensions || !vm.image.base64) {
        return {
          src: vm.dbOptions.Source
        }
      }
      const embeddedImageHeight =
        vm.width * (vm.image.dimensions.height / vm.image.dimensions.width)
      const fromBottom = vm.dbOptions.Position === 'bas'
      return {
        ...vm.options,
        x: parseFloat(vm.dbOptions.Decalage_x),
        y: parseFloat(
          fromBottom
            ? vm.height - embeddedImageHeight - vm.dbOptions.Decalage_y
            : vm.dbOptions.Decalage_y
        ),
        width: parseFloat(vm.dbOptions.Compression_x) * vm.width,
        height: parseFloat(vm.dbOptions.Compression_y) * embeddedImageHeight
      }
    }
  }
}
</script>

<style scoped></style>
