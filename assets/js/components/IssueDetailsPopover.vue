<template>
  <span>
    <span :id="id">
      <slot />
    </span>
    <b-popover
      :target="id"
      :placement="placement"
      triggers="hover focus manual"
    >
      <template #title>
        <Issue
          :publicationcode="publicationCode"
          :issuenumber="issueNumber"
          :publicationname="publicationNames[publicationCode]"
        />
      </template>
      <div class="d-flex flex-row">
        <img
          style="width: 80px; max-width: 80px"
          :alt="issueNumber"
          src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
          class="cover"
        >
        <div class="flex-grow-1">
          <label>Publication date</label>
          <div>Unknown</div>
        </div>
      </div>
      <b-table-simple><b-tbody>
        <b-tr><b-th>Stories</b-th><b-td><ul><li>Story 1</li><li>Story 2</li></ul></b-td></b-tr>
      </b-tbody></b-table-simple>
    </b-popover>
  </span>
</template>

<script>
import Issue from "./Issue";
import {mapState} from "vuex";

export default {
  name: "IssueDetailsPopover",
  components: {
    Issue
  },
  props: {
    publicationCode: {
      type: String,
      required: true
    },
    issueNumber: {
      type: String,
      required: true
    },
    placement: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState("coa", ["publicationNames"]),
    id() {
      return `issue-details-${this.publicationCode}-${this.issueNumber}`
    }
  },
  beforeUpdate() {
    console.log('popover beforeUpdate')
  }
}
</script>

<style scoped lang="scss">
.cover {
  float: left;
}
label {
  font-weight: bold;
}
</style>