<template>
  <div>
    <div class="DashboardContainer" />
    <div v-if="withProgress" class="UppyDragDrop-Progress"></div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'

require('@uppy/core/dist/style.css')
require('@uppy/dashboard/dist/style.css')

const Uppy = require('@uppy/core')
const Dashboard = require('@uppy/dashboard')
const XhrUpload = require('@uppy/xhr-upload')

export default {
  name: 'Upload',
  props: {
    withProgress: { type: Boolean, default: true },
    photo: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    edge: { type: Object, default: null },
  },
  data() {
    return {
      images: [],
      bytesUploaded: 0,
      bytesTotal: 0,
    }
  },
  mounted() {
    const vm = this
    const locale = this.$i18n.locales.find((locale) => locale.code === vm.$i18n.locale).iso

    const uppy = new Uppy({
      debug: true,
      locale: require(`@uppy/locales/lib/${locale.replace('-', '_')}.js`),
      allowMultipleUploads: false,
      meta: {
        photo: this.photo,
        multiple: this.multiple,
        edge: JSON.stringify(this.edge),
        locale,
      },
      restrictions: {
        maxFileSize: (this.photo ? 3 : 0.3) * 1024 * 1024,
        minNumberOfFiles: 1,
        maxNumberOfFiles: 1,
        allowedFileTypes: this.photo ? ['image/jpg', 'image/jpeg'] : ['image/png'],
      },
    })

    uppy
      .use(Dashboard, {
        inline: true,
        target: '.DashboardContainer',
        replaceTargetContent: true,
        note: this.$t('upload.restrictions'),
        height: 470,
        browserBackButtonClose: true,
        proudlyDisplayPoweredByUppy: false,
      })
      .use(XhrUpload, {
        endpoint: '/fs/upload',
        getResponseError: (responseText) => {
          const { error, placeholders } = JSON.parse(responseText)
          return new Error(this.$t(error, placeholders))
        },
      })
      .run()
    uppy.on('upload-progress', (data) => {
      vm.$emit('upload-progress', data)
      vm.bytesUploaded = data.bytesUploaded
    })
    uppy.on('upload-success', (fileId, payload) => {
      vm.loadItems({ itemType: vm.photo ? 'photos' : 'elements' })
      vm.$emit('upload-success')
      if (vm.photo) {
        if (!vm.multiple) {
          vm.setPhotoUrl({ issuenumber: vm.edge.issuenumber, filename: payload.body.filename })
        }
      }
    })
  },
  methods: {
    ...mapMutations(['setPhotoUrl']),
    ...mapActions(['loadItems']),
  },
}
</script>

<style scoped>
>>> .uppy-Dashboard-inner {
  width: 100vw !important;
  height: 100vh !important;
}

>>> a.uppy-Dashboard-poweredBy {
  display: none;
}
</style>
