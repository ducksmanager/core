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
        x: -25,
        y: 50,
        width: null,
        height: null,
        src: null,
        rotation: 270,
        fgColor: '#000000',
        bgColor: '#ffffff',
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
    image: { base64: null },
    attributeKeys: ['x', 'y', 'width', 'height'],
  }),

  computed: {
    ...mapState(['width', 'height']),
    effectiveText() {
      return this.resolveStringTemplates(this.options.text)
    },
  },

  watch: {
    textImage: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          try {
            this.image = await this.$axios.$get(`/fs/base64?${this.textImage.url}`)
          } catch (e) {
            console.error(`Base64 image could not be retrieved : ${newValue} : ${e}`)
          }
        }
      },
    },
    image: {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue.base64) {
          const vm = this
          this.waitUntil(
            () => vm.$refs.image,
            () => {
              vm.enableDragResize(vm.$refs.image, {
                onresizemove: ({ rect }) => {
                  let { width, height } = rect
                  const isVertical = [90, 270].includes(vm.options.rotation)
                  if (isVertical) {
                    ;[width, height] = [height, width]
                  }
                  const options = {
                    width: width / vm.zoom,
                    height: height / vm.zoom,
                  }

                  // Correct coordinates due to rotation center moving after resize
                  if (isVertical) {
                    options.y = vm.options.y - (options.height - vm.options.height) / 2
                    options.x = vm.options.x - (options.width - vm.options.width) / 2
                  }
                  vm.$root.$emit('set-options', options)
                },
              })
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
      const naturalAspectRatio = this.textImage.height / this.textImage.width
      const options = { ...this.options, stepNumber: this.stepNumber }
      if (options.height === null) {
        // By default, with a 270° rotation,
        // the text shouldn't be larger than the width of the edge
        // noinspection JSSuspiciousNameCombination
        options.height = 0.8 * this.width
        options.width = options.height / naturalAspectRatio
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
