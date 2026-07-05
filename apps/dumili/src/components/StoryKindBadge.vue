<template>
  <b-badge
    :size="isIncluded ? 'md' : 'xl'"
    :class="{ [`kind-${kind}`]: true }"
    class="text-black fw-normal fs-6"
    >{{ (kind && storyKinds[kind]) || $t("Type inconnu") }}
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
</script>
