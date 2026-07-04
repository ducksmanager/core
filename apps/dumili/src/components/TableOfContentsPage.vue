<template>
  <b-col
    role="button"
    class="h-100 position-relative d-flex justify-content-center align-items-center"
    :class="{
      'fw-bold': visiblePages?.has(page.id),
    }"
    @click="currentPage = page.pageNumber - 1"
    ><b-col cols="8">{{ page.pageNumber }}</b-col>
    <b-col cols="4"> <PageStoryKindTooltip :page="page" /></b-col>
  </b-col>
</template>
<script setup lang="ts">
import { ui } from "~/stores/ui";
import type { FullIndexation } from "~dumili-services/indexation";

const { page } = defineProps<{
  page: FullIndexation["pages"][number];
}>();

const { currentPage, visiblePages } = storeToRefs(ui());
</script>
