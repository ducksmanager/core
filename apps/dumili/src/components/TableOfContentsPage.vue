<template>
  <b-col
    role="button"
    class="h-100 position-relative d-flex justify-content-center align-items-center"
    :class="{
      'fw-bold': visiblePages?.has(id),
    }"
    @click="currentPage = pageNumber - 1"
    ><div>{{ $t("Page") }} {{ pageNumber }}</div>
    <PageStoryKindTooltip :page="page" />
  </b-col>
</template>
<script setup lang="ts">
import { ui } from "~/stores/ui";
import type { FullIndexation } from "~dumili-services/indexation/types";

const { page } = defineProps<{
  page: FullIndexation["pages"][number];
}>();

const { id, pageNumber } = page;

const { currentPage, visiblePages } = storeToRefs(ui());
</script>