import { mapState } from 'pinia'
import interact from 'interactjs'
import { ui } from '~/stores/ui'
import textTemplateMixin from '@/mixins/textTemplateMixin'

const shownTips = []

export default {
  mixins: [textTemplateMixin],
  props: {
    issuenumber: { type: String },
    dimensions: { type: Object },
    stepNumber: { type: Number },
  },

  computed: {
    ...mapState(ui, ['zoom']),
    width() {
      return this.dimensions.width
    },
    height() {
      return this.dimensions.height
    },
    attributes() {
      const vm = this
      return Object.keys(this.options)
        .filter((optionKey) => vm.attributeKeys.includes(optionKey))
        .reduce(
          (acc, optionKey) => ({
            ...acc,
            [optionKey]: vm.options[optionKey],
          }),
          {}
        )
    },
  },
  methods: {
    showMoveResizeToast(type, options = {}) {
      if (shownTips.includes(type)) {
        return
      }
      let text
      switch (type) {
        case 'move':
          text = this.$t(
            `You can make your selection snap to the top left corner of the edge by holding Shift while you drag it`
          )
          break
        case 'resize':
          text = this.$t(
            `You can make your selection match the {dimension} of the edge by holding Shift while you resize it`,
            {
              dimension: this.$t(
                options.edges.bottom && options.edges.right
                  ? 'width and height'
                  : options.edges.bottom
                  ? 'height'
                  : 'width'
              ),
            }
          )
      }
      this.$bvToast.toast(text, {
        title: this.$t('Tip'),
        id: 'move-resize-tip-toast',
        toaster: 'b-toaster-top-center',
        noCloseButton: true,
        autoHideDelay: 5000,
      })
      shownTips.push(type)
    },
    isColorOption(optionName) {
      return (
        optionName.toLowerCase().includes('color') ||
        ['fill', 'stroke'].includes(optionName)
      )
    },
    enableDragResize(element, { onmove = null, onresizemove = null } = {}) {
      const vm = this
      interact(element)
        .draggable({
          onmove: (e) => {
            document.body.classList.add('interacting')
            if (onmove) {
              onmove(e)
            } else {
              const { dx, dy, shiftKey } = e
              this.showMoveResizeToast('move')
              if (shiftKey) {
                vm.$root.$emit('set-options', {
                  x: 0,
                  y: 0,
                })
              } else {
                vm.$root.$emit('set-options', {
                  x: vm.options.x + dx / vm.zoom / 3,
                  y: vm.options.y + dy / vm.zoom / 3,
                })
              }
            }
          },
          onend: () => {
            document.body.classList.remove('interacting')
          },
        })
        .resizable({
          edges: { right: true, bottom: true },
        })
        .on('resizemove', (e) => {
          document.body.classList.add('interacting')
          if (onresizemove) {
            onresizemove(e)
          } else {
            const { rect, shiftKey, edges } = e
            this.showMoveResizeToast('resize', { edges })
            let { width, height } = rect
            width = width / vm.zoom
            height = height / vm.zoom
            if (shiftKey) {
              if (edges.bottom) {
                height = this.height
              }
              if (edges.right) {
                width = this.width
              }
            }
            vm.$root.$emit('set-options', {
              width,
              height,
            })
          }
        })

        .on('resizeend', () => {
          document.body.classList.remove('interacting')
        })
    },
  },
  mounted() {
    const { issuenumber, stepNumber } = this
    this.$root.$emit('set-options', {
      ...this.options,
      issuenumbers: [issuenumber],
      stepNumber,
    })
  },
}
