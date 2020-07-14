<template>
  <b-modal
    ok-only
    :ok-disabled="!issue"
    title="Création de tranche"
    visible
    @close="toDashboard"
    @ok="startEditing"
  >
    {{ $t('prompt.select_issue') }}
    <issue-select @change="issue = $event" />
  </b-modal>
</template>
<script>
import IssueSelect from '../../components/IssueSelect'
export default {
  components: { IssueSelect },
  data() {
    return {
      issue: null,
    }
  },
  methods: {
    toDashboard() {
      window.location.replace(`/`)
    },
    startEditing() {
      window.location.replace(`/edit/${this.issue.publicationCode}/${this.issue.issueNumber}`)
    },
  },
}
</script>
<style></style>
