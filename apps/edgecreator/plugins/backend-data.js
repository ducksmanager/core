import Vue from 'vue'
import BackendDataPlugin from 'ducksmanager/assets/js/plugins/backendDataPlugin'

Vue.use(BackendDataPlugin, {
  overrides: {
    imagePath: '/images',
  },
})
