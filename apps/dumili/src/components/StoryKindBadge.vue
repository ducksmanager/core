<template>
  <b-badge
    size="xl"
    :class="{ [`kind-${kind}`]: true }"
    class="text-black fw-normal fs-6"
    >{{ (kind && storyKinds[kind]) || $t("Type inconnu") }}</b-badge
  >
</template>
<script setup lang="ts">
import { storyKinds } from "~dumili-types/storyKinds";
import type { storyKind } from "~prisma/client_dumili/client";

defineProps<{
  kind?: storyKind;
}>();

const { t: $t } = useI18n();
</script>