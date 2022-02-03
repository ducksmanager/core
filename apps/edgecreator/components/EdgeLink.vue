<template>
  <span>
    <Issue
      :publicationcode="publicationcode"
      :publicationname="publicationNames[publicationcode]"
      :issuenumber="issuenumber"
      hide-condition
    />
    <div>
      <b-badge v-if="published">modification</b-badge>
      <b-badge v-for="designer in designers" :key="`designer-${designer}`"
        >{{ $t('Designer') }}:{{ designer }}</b-badge
      >
      <b-badge
        v-for="photographer in photographers"
        :key="`photographer-${photographer}`"
        >{{ $t('Photographer') }}:{{ photographer }}</b-badge
      >
    </div>
  </span>
</template>

<script>
import { mapState } from 'pinia'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'
import { coa } from '~/stores/coa'

export default {
  name: 'EdgeLink',
  components: {
    Issue,
  },
  props: {
    publicationcode: {
      type: String,
      required: true,
    },
    issuenumber: {
      type: String,
      required: true,
    },
    designers: {
      type: Array,
      required: true,
    },
    photographers: {
      type: Array,
      required: true,
    },
    published: {
      type: Boolean,
      required: true,
    },
  },

  computed: {
    ...mapState(coa, ['publicationNames']),
  },
}
</script>

<style scoped></style>
