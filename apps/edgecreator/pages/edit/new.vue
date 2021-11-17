<template>
  <b-modal
    ok-only
    :ok-disabled="!issueData"
    :title="$t('Create or edit an edge model')"
    visible
    @close="toDashboard"
    @ok="startEditing"
  >
    {{ $t('Select the issue that you want to create the edge of.') }}
    <issue-select
      can-be-multiple
      disable-ongoing-or-published
      :disable-not-ongoing-nor-published="false"
      @change="
        issueData = $event && $event.issueNumber !== null ? $event : null
      "
    />
  </b-modal>
</template>
<script>
import IssueSelect from '@/components/IssueSelect'

export default {
  components: { IssueSelect },
  middleware: ['authenticated', 'is-editor'],
  data() {
    return {
      issueData: null,
    }
  },
  computed: {
    issueSpecification() {
      if (this.issueData === null) {
        return null
      } else {
        switch (this.issueData.editMode) {
          case 'range':
            return `${this.issueData.issueNumber} to ${this.issueData.issueNumberEnd}`
        }
        return this.issueData.issueNumber
      }
    },
  },
  methods: {
    toDashboard() {
      window.location.replace(`/`)
    },
    startEditing() {
      window.location.replace(
        `/edit/${this.issueData.publicationCode} ${this.issueSpecification}`
      )
    },
  },
}
</script>
<style></style>
