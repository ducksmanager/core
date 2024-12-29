<template>
  <b-badge
    size="xl"
    :class="{ [`kind-${storyKind}`]: true }"
    class="text-black fw-normal fs-6"
    >{{ (storyKind && storyKinds[storyKind]) || $t("Type inconnu") }}</b-badge
  >
</template>
<script setup lang="ts">
import { storyKinds } from "~dumili-types/storyKinds";
import type { storyKind } from "~prisma/client_dumili";

defineProps<{
  storyKind?: storyKind | null;
}>();

const { t: $t } = useI18n();
</script>