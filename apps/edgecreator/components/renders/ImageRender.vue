<template>
  <svg>
    <image ref="image" v-bind="options" :xlink:href="image.base64" preserveAspectRatio="none">
      <metadata>{{ options }}</metadata>
    </image>
  </svg>
</template>

<script>
import { mapState } from 'vuex'

import stepOptionsMixin from '@/mixins/stepOptionsMixin'

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
        src: null,
      },
    }
  },

  computed: {
    ...mapState(['country']),
  },

  watch: {
    async 'options.src'() {
      await this.retrieveImage()
      this.enableDragResize(this.$refs.image)
    },
    async image(newValue) {
      if (newValue && this.dbOptions) {
        this.copyOptions(await this.getOptionsFromDb())
      }
    },
  },

  methods: {
    async retrieveImage() {
      this.image = await this.$axios.$get(`/fs/base64?${this.country}/elements/${this.options.src}`)
    },

    async onOptionsSet() {
      await this.retrieveImage()
      this.enableDragResize(this.$refs.image)
    },

    async getOptionsFromDb() {
      const vm = this
      if (!vm.image.dimensions || !vm.image.base64) {
        return {
          src: vm.dbOptions.Source,
        }
      }
      const embeddedImageHeight =
        vm.width * (vm.image.dimensions.height / vm.image.dimensions.width)
      const fromBottom = vm.dbOptions.Position === 'bas'
      return {
        ...vm.options,
        x: parseFloat(vm.dbOptions.Decalage_x || 0),
        y: parseFloat(
          fromBottom
            ? vm.height - embeddedImageHeight - (vm.dbOptions.Decalage_y || 0)
            : vm.dbOptions.Decalage_y || 0
        ),
        width: parseFloat(vm.dbOptions.Compression_x || 1) * vm.width,
        height: parseFloat(vm.dbOptions.Compression_y || 1) * embeddedImageHeight,
      }
    },
  },
}
</script>

<style scoped></style>
