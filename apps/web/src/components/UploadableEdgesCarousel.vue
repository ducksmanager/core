<template>
  <div>
    <slot name="header" />
    <div>
      <b-carousel v-model="currentSlide" controls>
        <b-carousel-slide
          v-for="(popularIssueWithoutEdge, index) in issues"
          :key="popularIssueWithoutEdge.edgeId"
          :active="currentSlide === index"
        >
          <Issue
            :issuecode="popularIssueWithoutEdge.issuecode"
            hide-condition
          />
          <MedalProgress
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
import type { BookcaseEdgeWithPopularity } from "~/stores/bookcase";

defineProps<{
  issues: BookcaseEdgeWithPopularity[];
  userPoints: number;
}>();

const currentSlide = $ref(0);
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

  .carousel-caption {
    position: initial;
    padding-left: 48px;
    padding-right: 42px;
  }
}
</style>
