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
      embedded
    />
    <slot name="footer">
      <b-row>
        <b-col
          v-for="(edge, edgeId) in edges"
          :key="`bookcase-${id}-issue-${edgeId}`"
          cols="6"
        >
          <Issue
            v-if="publicationNames[edge.publicationCode]"
            class="issue"
            :publicationname="publicationNames[edge.publicationCode]"
            :publicationcode="edge.publicationCode"
            :issuenumber="edge.issueNumber"
            hide-condition
            :flex="false"
          />
        </b-col>
      </b-row>
    </slot>
  </b-popover>
</template>
<script setup>
import { BCol, BPopover, BRow } from "bootstrap-vue-3";

import { coa } from "../stores/coa";
import Bookcase from "./Bookcase";

defineProps({
  id: {
    type: String,
    required: true,
  },
  edges: {
    type: Array,
    required: true,
  },
});

const bookcaseTextures = {
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
};

const publicationNames = $computed(() => coa().publicationNames);
</script>

<style lang="scss" scoped>
.popover {
  max-width: 25vw;
  max-height: 90vh;
  overflow: auto;

  .popover-body {
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }

  :deep(.bookcase) {
    margin-top: 0 !important;
  }

  :deep(.issue) {
    padding: 0 10px;
  }
}
</style>
