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
import { BCarousel, BCarouselSlide } from "bootstrap-vue-3";

defineProps({
  issues: { type: Array, required: true },
  userPoints: { type: Number, required: true },
  publicationNames: { type: Object, required: true },
});

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
