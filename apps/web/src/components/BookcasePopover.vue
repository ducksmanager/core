<template>
  <Popover>
    <slot />
    <template #content>
      <Bookcase
        :bookcase-textures="bookcaseTextures"
        :sorted-bookcase="edges"
        embedded
      />
      <b-row>
        <b-col
          v-for="(edge, edgeId) in edges"
          :key="`bookcase-${id}-issue-${edgeId}`"
          cols="6"
        >
          <Issue
            v-if="publicationNames[edge.publicationcode]"
            class="issue"
            :publicationname="publicationNames[edge.publicationcode]!"
            :publicationcode="edge.publicationcode"
            :short-issuenumber="edge.shortIssuenumber"
            hide-condition
            :flex="false"
          />
        </b-col>
      </b-row>
    </template>
  </Popover>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  edges: { publicationcode: string; shortIssuenumber: string }[];
}>();

const bookcaseTextures = {
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
};

const { publicationNames } = storeToRefs(coa());
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
