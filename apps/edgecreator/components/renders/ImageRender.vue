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
import base64Mixin from '@/mixins/base64Mixin'

export default {
  mixins: [stepOptionsMixin, base64Mixin],

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
          this.loadImage(
            `${process.env.EDGES_URL_PUBLIC}/${this.country}/elements/${this.effectiveSource}`
          )
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
