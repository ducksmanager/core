<template>
  <div>
    <div class="DashboardContainer" />
    <div v-if="withProgress" class="UppyDragDrop-Progress"></div>
  </div>
</template>

<script>
require('@uppy/core/dist/style.css')
require('@uppy/dashboard/dist/style.css')

const Uppy = require('@uppy/core')
const Dashboard = require('@uppy/dashboard')
const ProgressBar = require('@uppy/status-bar')
const XhrUpload = require('@uppy/xhr-upload')

export default {
  name: 'Upload',
  props: {
    withProgress: { type: Boolean, default: true },
    photo: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
  },
  data() {
    return {
      images: [],
      bytesUploaded: 0,
      bytesTotal: 0,
      showProgress: false,
    }
  },
  mounted() {
    const vm = this
    const locale = this.$i18n.locales.find((locale) => locale.code === vm.$i18n.locale).iso

    const uppy = new Uppy({
      debug: true,
      locale: require(`@uppy/locales/lib/${locale.replace('-', '_')}`),
      allowMultipleUploads: false,
      meta: {
        photo: this.photo,
        multiple: this.multiple,
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
        showProgressDetails: true,
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
      .use(ProgressBar, { target: '.UppyDragDrop-Progress' })
      .run()
    uppy.on('core:upload-progress', (data) => {
      vm.$emit('core:upload-progress', data)
      this.bytesUploaded = data.bytesUploaded
    })
    uppy.on('core:upload-success', (fileId, payload) => {
      const data = { fileId, data: payload }
      vm.$emit('core:upload-success', data)
      this.images.push(data)
    })
    uppy.on('core:success', (fileCount) => {
      vm.$emit('core:success', fileCount)
      this.showProgress = false
    })
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
