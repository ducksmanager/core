<template>
  <b-popover
    :target="id"
    placement="auto top"
    boundary="viewport"
    triggers="hover focus"
    :delay="0"
  >
    <Bookcase
      :bookcase-textures="bookcaseTextures"
      :sorted-bookcase="edges"
    />
    <slot name="footer">
      <Issue
        v-for="edge in edges"
        :key="edge.id"
        class="issue"
        :publicationname="publicationNames[edge.publicationCode]"
        :publicationcode="edge.publicationCode"
        :issuenumber="edge.issueNumber"
        hide-condition
        :no-wrap="false"
      />
    </slot>
  </b-popover>
</template>
<script>
import Bookcase from "./Bookcase"
import Issue from "../components/Issue"
import {mapState} from "vuex";

export default {
  name: 'BookcasePopover',
  components: {Bookcase, Issue},
  props: {
    id: {
      type: String,
      required: true
    },
    edges: {
      type: Array,
      required: true
    },
  },

  data: () => ({
    bookcaseTextures: {bookcase: 'bois/HONDURAS MAHOGANY', bookshelf: 'bois/KNOTTY PINE'}
  }),

  computed: {
    ...mapState("coa", ["publicationNames"]),
  }
}
</script>

<style lang="scss" scoped>
  .popover-body {
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }

  ::v-deep .bookcase {
    margin-top: 0 !important;
  }

  ::v-deep .issue{
    padding: 0 10px;
  }
</style>
