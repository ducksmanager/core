<template>
  <b-badge
    size="xl"
    :class="{ [`kind-${storyKindRows?.kind}`]: true }"
    class="text-black fw-normal fs-6"
    >{{
      (storyKindRows && storyKinds[storyKindRows?.kind]) || $t("Type inconnu")
    }}</b-badge
  >
</template>
<script setup lang="ts">
import { storyKinds } from "~dumili-types/storyKinds";
import type { storyKindRows } from "~prisma/client_dumili";

defineProps<{
  storyKindRows?: storyKindRows | null;
}>();

const { t: $t } = useI18n();
</script>