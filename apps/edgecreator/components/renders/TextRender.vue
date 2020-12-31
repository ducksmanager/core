<!--suppress RequiredAttributes, HtmlUnknownAttribute -->
<template>
  <svg v-if="options.x !== undefined">
    <image
      ref="image"
      preserveAspectRatio="none"
      v-bind="attributes"
      :xlink:href="image.base64"
      :transform="
        !options.width
          ? null
          : `rotate(${options.rotation}, ${options.x + options.width / 2}, ${
              options.y + options.height / 2
            })`
      "
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
        x: -35,
        y: 50,
        width: null,
        height: null,
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
    attributeKeys: ['x', 'y', 'width', 'height'],
  }),

  computed: {
    ...mapState(['width', 'height']),
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
        if (newValue) {
          try {
            this.image = await this.$axios.$get(
              `/fs/base64?images_myfonts/${this.textImage.imageId}.png`
            )
          } catch (e) {
            console.error(`Text image details could not be retrieved : ${newValue} : ${e}`)
          }
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
              vm.applyTextImageDimensions()
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
        Math.round(internalWidth * 100) / 100,
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

    applyTextImageDimensions() {
      const naturalAspectRatio = this.image.height / this.image.width
      const options = { ...this.options, stepNumber: this.stepNumber }
      if (options.height === null) {
        // By default, with a 270° rotation,
        // the text shouldn't be larger than the width of the edge
        options.height = Math.min(this.image.height, this.width)
      } else if (options.heightCompression) {
        if (options.rotation === 90 || options.rotation === 270) {
          options.height = options.widthCompression * this.width
          options.width = (options.heightCompression * this.width) / naturalAspectRatio
          options.x -= options.width / 2 - options.height / 2
          options.y += options.width / 2
        } else {
          options.height = options.heightCompression * this.width * naturalAspectRatio
          options.width = options.widthCompression * this.width
        }
        options.heightCompression = undefined
        options.widthCompression = undefined
      }
      options.aspectRatio = options.height / options.width
      this.$root.$emit('set-options', options)
    },
  },
}
</script>

<style scoped>
image {
  touch-action: none;
}
</style>
