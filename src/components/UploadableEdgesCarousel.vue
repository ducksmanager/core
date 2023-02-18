<template>
  <div>
    <slot name="header" />
    <div>
      <b-carousel v-model="currentSlide" controls>
        <b-carousel-slide
          v-for="(popularIssueWithoutEdge, index) in issues"
          :key="popularIssueWithoutEdge.issueCode"
          :active="currentSlide === index"
        >
          <Issue
            :publicationcode="popularIssueWithoutEdge.publicationcode"
            :publicationname="
              publicationNames[popularIssueWithoutEdge.publicationcode]
            "
            :issuenumber="popularIssueWithoutEdge.issuenumber"
            hide-condition
          />
          <MedalProgress
            contribution="edge_photographer"
            :user-level-points="userPoints"
            :extra-points="popularIssueWithoutEdge.popularity"
          />
          <slot name="footer" />
        </b-carousel-slide>
      </b-carousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookcaseEdgeWithPopularity } from "~/stores/bookcase";

defineProps<{
  issues: BookcaseEdgeWithPopularity[];
  userPoints: number;
  publicationNames: {
    [publicationcode: string]: string;
  };
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
