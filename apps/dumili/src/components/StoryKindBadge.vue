<template>
  <b-badge
    v-if="isIncluded"
    size="md"
    :class="`border border-secondary kind-${kind}`"
    :title="text"
    >&nbsp;</b-badge
  >
  <b-badge v-else size="xl" :class="`text-black fw-normal fs-6 kind-${kind}`"
    >{{ text }}
    <div v-if="includedEntryKinds?.length" class="text-secondary">
      {{ $t("includes") }}&nbsp;<story-kind-badge
        v-for="(includedKind, includedKindIndex) in includedEntryKinds"
        :key="`included-${includedKindIndex}`"
        is-included
        :included-entry-kinds="[]"
        :kind="includedKind"
      />
    </div>
  </b-badge>
</template>
<script setup lang="ts">
import { storyKinds } from "~dumili-types/storyKinds";
import type { storyKind } from "~prisma/client_dumili/client";

const {
  kind = undefined,
  includedEntryKinds = undefined,
  isIncluded = false,
} = defineProps<{
  kind?: storyKind;
  includedEntryKinds?: (storyKind | undefined)[];
  isIncluded?: boolean;
}>();

const { t: $t } = useI18n();

const text = computed(() => (kind && storyKinds[kind]) || $t("Type inconnu"));
</script>

<style lang="scss" scoped>
.border {
  width: 1.5rem;
  height: 1.5rem;
  margin: 0.2rem;
}
</style>