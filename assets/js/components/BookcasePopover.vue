<template>
  <Popover>
    <slot />
    <template #content>
      <Bookcase
        :bookcase-textures="bookcaseTextures"
        :sorted-bookcase="edges"
        embedded />
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
        </b-col> </b-row
    ></template>
  </Popover>
</template>
<script setup>
import { BCol, BPopover, BRow } from "bootstrap-vue-3";

import Issue from "../components/Issue";
import { coa } from "../stores/coa";
import Bookcase from "./Bookcase";
import Popover from "./Popover";

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

<style lang="scss">
.popper {
  max-width: 25vw;
  max-height: 90vh;
  overflow: auto;

  > .card {
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }

  .bookcase {
    margin-top: 0 !important;
  }

  .issue {
    padding: 0 10px;
  }
}
</style>
