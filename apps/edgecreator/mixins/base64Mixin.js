export default {
  data: () => ({
    image: { base64: null, width: null, height: null },
  }),

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
      img.onerror = function (e) {
        console.error(`Base64 image could not be retrieved : ${src} : ${e}`)
        vm.image = { base64: null, width: null, height: null }
      }
      img.src = src
    },
  },
}
