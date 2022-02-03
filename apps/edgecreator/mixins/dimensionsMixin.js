import Vue from 'vue'
import { mapState } from 'pinia'
import { editingStep } from '~/stores/editingStep'

export default {
  data: () => ({
    dimensions: {},
  }),

  computed: {
    ...mapState(editingStep, { editingIssuenumbers: 'issuenumbers' }),
  },

  methods: {
    setDimensions(dimensions, issuenumber) {
      const issuenumbers = issuenumber
        ? [issuenumber]
        : this.editingIssuenumbers
      for (const issuenumber of issuenumbers) {
        Vue.set(this.dimensions, issuenumber, {
          width: parseInt(dimensions.width),
          height: parseInt(dimensions.height),
        })
      }
    },
  },
}
