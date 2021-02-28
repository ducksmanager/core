<!--suppress RequiredAttributes, HtmlUnknownAttribute -->
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
            this.image = await this.$axios.$get(
              `/fs/base64?${this.country}/elements/${this.effectiveSource}`
            )
            this.enableDragResize(this.$refs.image)
          } catch (e) {
            console.error(`Image could not be retrieved : ${this.effectiveSource}`)
            this.image = { base64: null, width: null, height: null }
          }
        }
      },
    },
  },
  async mounted() {
    this.enableDragResize(this.$refs.image)
  },
}
</script>

<style scoped>
image {
  touch-action: none;
}
</style>
