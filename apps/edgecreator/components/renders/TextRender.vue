<!--suppress RequiredAttributes, HtmlUnknownAttribute -->
<template>
  <svg>
    <image
      v-if="options.x !== undefined"
      ref="image"
      preserveAspectRatio
      v-bind="options"
      :xlink:href="imageUrl"
      :transform="`rotate(${options.rotation}, ${options.x + options.width / 2}, ${
        options.y + options.height / 2
      })`"
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
        rotation: 270,
        fgColor: '000000',
        bgColor: 'ffffff',
        font: 'redrooster/block-gothic-rr/demi-extra-condensed',
        text: 'Le journal de mickey',
        internalWidth: 700,
        isHalfHeight: true,
      }),
    },
  },

  data: () => ({
    textImage: null,
    textImageOptions: {},
    image: { base64: null, width: null, height: null },
  }),

  computed: {
    ...mapState(['width']),
    imageUrl() {
      return this.textImage
        ? `${process.env.EDGES_URL}/images_myfonts/${this.textImage.imageId}.png`
        : ''
    },
    effectiveText() {
      return this.resolveStringTemplates(this.options.text)
    },
  },

  watch: {
    imageUrl: {
      immediate: true,
      async handler(newValue) {
        try {
          this.image = await this.$axios.$get(newValue)
        } catch (e) {
          console.error(`Text image details could not be retrieved : ${newValue}`)
        }
      },
    },
    image: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const vm = this
          this.waitUntil(
            () => vm.$refs.image,
            () => {
              vm.enableDragResize(vm.$refs.image)
            },
            2000,
            100
          )
        }
      },
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
    },
  },

  async mounted() {
    await this.refreshPreview()
  },

  methods: {
    async refreshPreview() {
      if (JSON.stringify(this.textImageOptions) === JSON.stringify(this.options)) {
        return
      }
      this.textImageOptions = { ...this.options }
      const { fgColor, bgColor, internalWidth, font } = this.options
      const url = `/fs/text/${[
        fgColor.replace('#', ''),
        bgColor.replace('#', ''),
        internalWidth,
        'font',
        font,
        'text',
        this.effectiveText,
      ].join('/')}`
      try {
        this.textImage = await this.$axios.$get(url, {
          headers: {
            imageWidth: this.width,
            'Content-Type': 'application/json',
          },
        })
      } catch (e) {
        console.error(`Text image could not be retrieved : ${url}`)
      }
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
    },
  },
}
</script>

<style scoped></style>
