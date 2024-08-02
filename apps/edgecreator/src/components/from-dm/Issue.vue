<template>
  <div :class="`d-${noWrap ? 'inline' : 'block'}`">
    <router-link
      :class="{ clickable, flex }"
      :to="`/collection/show/${publicationcode}#${issuenumber}`"
    >
      <!--      <span v-if="!hideCondition" class="me-1 d-flex"-->
      <!--        ><Condition-->
      <!--          v-once-->
      <!--          :publicationcode="publicationcode"-->
      <!--          :issuenumber="issuenumber"-->
      <!--      /></span>-->
      <Publication
        :publicationcode="publicationcode"
        :publicationname="publicationname || publicationcode"
        display-class="d-inline"
      />{{ issuenumber }}
      <slot name="title-suffix" />
    </router-link>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { coa } from "~web/src/stores/coa";

const {
  clickable = false,
  noWrap = true,
  flex = true,
  issuecode,
} = defineProps<{
  issuecode: string;
  clickable?: boolean;
  hideCondition?: boolean;
  noWrap?: boolean;
  flex?: boolean;
}>();

const publicationname = computed(
  () => publicationcode.value && coa().publicationNames[publicationcode.value],
);
const publicationcode = computed(
  () =>
    coa().issuecodeDetails[issuecode] &&
    coa().issuecodeDetails[issuecode].publicationcode,
);
const issuenumber = computed(
  () => coa().issuecodeDetails[issuecode].issuenumber,
);
</script>

<style scoped lang="scss">
a {
  align-items: center;
  line-height: 1rem;
  height: 1.1rem;
  color: darkgrey;
  pointer-events: none;
  border-bottom: none;

  &.flex {
    display: inline-flex;
  }

  &.clickable {
    pointer-events: initial;
    border-bottom: initial;
  }
}
</style>
