<template>
  <div :class="`d-${noWrap ? 'inline' : 'block'}`">
    <template v-if="issue?.publicationcode">
      <router-link
        :class="{ clickable, flex }"
        :to="`/collection/show/${issue.publicationcode}#${issue.issuenumber}`"
      >
        <span v-if="!hideCondition" class="me-1 d-flex"
          ><Condition v-once :is-public="isPublic" :issuecode="issue.issuecode"
        /></span>
        <Publication
          :publicationcode="issue.publicationcode"
          :publicationname="publicationname || issue.publicationcode"
          display-class="d-inline"
        />{{ issue.issuenumber }}
        <slot name="title-suffix" />
      </router-link>
      <slot />
    </template>
    <template v-else>
      <span>{{ issuecode }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
const {
  issuecode = undefined,
  issue: propIssue = undefined,
  clickable = false,
  hideCondition = false,
  noWrap = true,
  flex = true,
  isPublic = false,
} = defineProps<
  (
    | {
        issuecode: string;
        issue?: never;
      }
    | {
        issue: {
          issuecode: string;
          publicationcode: string;
          issuenumber: string;
        };
        issuecode?: never;
      }
  ) & {
    clickable?: boolean;
    hideCondition?: boolean;
    noWrap?: boolean;
    flex?: boolean;
    isPublic?: boolean;
  }
>();

const store = coa();
const issue = computed(() =>
  issuecode ? store.issuecodeDetails?.[issuecode] : propIssue!,
);
const publicationname = computed(
  () =>
    issue.value?.publicationcode &&
    store.publicationNames?.[issue.value.publicationcode],
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
