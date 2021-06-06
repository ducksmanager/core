<template>
  <div>
    <slot name="header" />
    <div>
      <b-carousel
        controls
        indicators
      >
        <b-carousel-slide
          v-for="popularIssueWithoutEdge in issues"
          :key="popularIssueWithoutEdge.issueCode"
        >
          <Issue
            :publicationcode="popularIssueWithoutEdge.publicationCode"
            :publicationname="publicationNames[popularIssueWithoutEdge.publicationCode]"
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
<script>
import MedalProgress from "./MedalProgress";
import Issue from "./Issue";

export default {
  name: "UploadableEdgesCarousel",

  components: {
    MedalProgress,
    Issue
  },

  props: {
    issues: { type: Array, required: true},
    userPoints: { type: Number, required: true},
    publicationNames: { type: Object, required: true}
  },
};
</script>

<style scoped>

</style>