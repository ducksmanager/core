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

  data() {
    return {
      image: { base64: null, width: null, height: null },
    }
  },

  computed: {
    ...mapState(['country', 'width']),
  },

  watch: {
    async 'options.src'() {
      try {
        this.image = await this.$axios.$get(
          `/fs/base64?${this.country}/elements/${this.options.src}`
        )
        this.enableDragResize(this.$refs.image)
      } catch (e) {
        console.error(`Image could not be retrieved : ${this.options.src}`)
      }
    },
  },
  async mounted() {
    this.enableDragResize(this.$refs.image)
  },
}
</script>

<style scoped></style>
