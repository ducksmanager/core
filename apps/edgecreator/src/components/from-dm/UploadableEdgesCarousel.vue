<template>
  <div>
    <slot name="header" />
    <div>
      <b-carousel
        v-model="currentSlide"
        controls
        indicators
      >
        <b-carousel-slide
          v-for="(popularIssueWithoutEdge, index) in issues"
          :key="popularIssueWithoutEdge.issueCode"
          :active="currentSlide === index"
        >
          <issue
            no-wrap
            :issuecode="popularIssueWithoutEdge.issuecode"
            hide-condition
          />
          <medal-progress
            contribution="edge_photographer"
            :user-level-points="userPoints"
            :extra-points="popularIssueWithoutEdge.popularity || 0"
          />
          <slot name="footer" />
        </b-carousel-slide>
      </b-carousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookcaseEdge } from "~dm-types/BookcaseEdge";

import Issue from "./Issue.vue";
interface BookcaseEdgeWithPopularity extends BookcaseEdge {
  issueCode: string;
  popularity?: number | undefined;
}
defineProps<{
  issues: BookcaseEdgeWithPopularity[];
  userPoints: number;
  publicationNames: Record<string, string>;
}>();

const currentSlide = ref(0);
</script>

<style scoped lang="scss">
:deep(.carousel) {
  width: 400px;
  height: 120px;
  margin: 15px 0 0;

  .carousel-inner {
    height: 100%;
    padding: 0 10px;

    > div {
      background: initial !important;
    }
  }

  .carousel-indicators {
    position: absolute;
    top: 0;
  }

  .carousel-caption {
    position: initial;
    padding-left: 48px;
    padding-right: 42px;
  }
}
</style>
