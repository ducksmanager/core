<!--suppress RequiredAttributes, HtmlUnknownAttribute -->
<template>
  <svg>
    <image
      ref="image"
      v-bind="options"
      :xlink:href="image.base64"
      preserveAspectRatio="none"
    >
      <metadata>{{ options }}</metadata>
    </image>
  </svg>
</template>

<script>
import { mapState } from 'vuex'

import stepOptionsMixin from '@/mixins/stepOptionsMixin'

export default {
  mixins: [stepOptionsMixin],

  props: {
    options: {
      type: Object,
      default: () => ({
        x: 5,
        y: 5,
        width: 15,
        height: 15,
        src: null,
      }),
    },
  },

  data: () => ({
    image: { base64: null, width: null, height: null },
    attributeKeys: ['x', 'y', 'width', 'height'],
  }),

  computed: {
    ...mapState(['country']),
    effectiveSource() {
      return this.resolveStringTemplates(this.options.src)
    },
  },

  watch: {
    'options.src': {
      immediate: true,
      async handler() {
        if (this.effectiveSource) {
          try {
            this.loadImage(
              `${process.env.EDGES_URL_PUBLIC}/${this.country}/elements/${this.effectiveSource}`
            )
          } catch (e) {
            console.error(
              `Image could not be retrieved : ${this.effectiveSource}`
            )
            this.image = { base64: null, width: null, height: null }
          }
        }
      },
    },
  },
  async mounted() {
    this.enableDragResize(this.$refs.image)
  },
  methods: {
    loadImage(src) {
      const vm = this
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = function () {
        const canvas = document.createElement('CANVAS')
        const ctx = canvas.getContext('2d')
        canvas.height = this.naturalHeight
        canvas.width = this.naturalWidth
        ctx.drawImage(this, 0, 0)
        vm.image = {
          base64: canvas.toDataURL('png'),
          width: this.naturalWidth,
          height: this.naturalHeight,
        }
        vm.enableDragResize(vm.$refs.image)
      }
      img.src = src
    },
  },
}
</script>

<style scoped>
image {
  touch-action: none;
}
</style>
