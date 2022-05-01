<template>
  <div>
    <slot name="header" />
    <div>
      <b-carousel controls indicators>
        <b-carousel-slide
          v-for="popularIssueWithoutEdge in issues"
          :key="popularIssueWithoutEdge.issueCode"
        >
          <Issue
            :publicationcode="popularIssueWithoutEdge.publicationCode"
            :publicationname="
              publicationNames[popularIssueWithoutEdge.publicationCode]
            "
            :issuenumber="popularIssueWithoutEdge.issueNumber"
            hide-condition
          />
          <MedalProgress
            contribution="Photographe"
            :user-level-points="userPoints"
            :extra-points="popularIssueWithoutEdge.popularity"
          />
          <slot name="footer" />
        </b-carousel-slide>
      </b-carousel>
    </div>
  </div>
</template>
<script setup>
import MedalProgress from "./MedalProgress";
import Issue from "./Issue";
import { BCarousel, BCarouselSlide } from "bootstrap-vue-3";

defineProps({
  issues: { type: Array, required: true },
  userPoints: { type: Number, required: true },
  publicationNames: { type: Object, required: true },
});
</script>

<style scoped lang="scss">
:deep(.carousel) {
  width: 400px;
  height: 120px;
  margin: 15px 0 0;

  .carousel-inner {
    height: 100%;
  }

  .carousel-caption {
    position: initial;
    padding-left: 48px;
    padding-right: 42px;
  }

  ol.carousel-indicators {
    top: 0;
    bottom: initial;

    li {
      width: 5px;
      height: 5px;
      border: 5px solid white;
      border-radius: 8px;
      padding: 0;
      background: white;
    }
  }
}
</style>
