<template>
  <PublicationStats v-if="tab === 'publications'" />
</template>

<script>
import PublicationStats from "./stats/PublicationStats";

export default {
  name: "Stats",
  components: {
    PublicationStats
  },
  props: {
    tab: {
      type: String,
      required: true
    }
  },
  computed: {
    imagePath: () => window.imagePath,
    username: () => window.username
  }
}
</script>

<style scoped lang="scss">
#logo_zone1 {
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: rgb(200, 137, 100) !important;
  height: 180px;

  a {
    position: absolute;
    border-bottom: none;

    &:hover {
      border-bottom: 0 !important;
    }
  }
}

@media (max-width: 767px) {
  #logo_zone1 {
    display: none;
  }
}
</style>