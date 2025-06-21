<template>
  <Popover>
    <slot />
    <template #content>
      <Bookcase
        :bookcase-textures="bookcaseTextures"
        :sorted-bookcase="issuecodes.map((issuecode) => ({ issuecode }))"
        embedded
      />
      <b-row>
        <b-col
          v-for="(issuecode, idx) in issuecodes"
          :key="`bookcase-${id}-issue-${idx}`"
          cols="6"
        >
          <Issue
            class="issue"
            :issuecode="issuecode"
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
  issuecodes: string[];
}>();

const bookcaseTextures = {
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
};
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
