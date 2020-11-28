<template>
  <span>
    <span
      :id="elementId"
      class="username font-weight-bold"
    >{{ stats.username }}</span>
    <b-popover
      :target="elementId"
      placement="top"
      triggers="hover"
      :delay="0"
    >
      <template #title>
        <h4>{{ stats.username }}</h4>
      </template>
      <div class="d-flex">
        <Medal
          v-for="(numberOfPoints, contribution) in points"
          :key="contribution"
          :contribution="contribution"
          :user-level-points="numberOfPoints"
          small
        />
      </div>
      <div class="clearfix" />
      <div>
        {{ stats.numberOfIssues }} {{ l10n.NUMEROS }}<br>
        {{ stats.numberOfPublications }} {{ l10n.MAGAZINES }}<br>
        {{ stats.numberOfCountries }} {{ l10n.PAYS }}
      </div>
      <div
        v-if="bookcaseShared"
        class="bookcase-link"
      >
        <img :src="`${imagePath}/icons/bookcase.png`">&nbsp;
        <b-button
          size="xs"
          variant="outline-secondary"
          target="_blank"
          :href="$r(`/bookcase/show/{username:${stats.username}}`)"
        >
          {{ l10n.VOIR_BIBLIOTHEQUE }}
        </b-button>
      </div>
    </b-popover>
  </span>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import Medal from "./Medal";

export default {
  name: "UserPopover",
  components: {
    Medal
  },
  mixins: [l10nMixin],
  props: {
    id: {type: Number, required: true},
    points: {type: Object, required: true},
    stats: {type: Object, required: true}
  },

  data: () => ({
    bookcaseShared: true,
    elementId: null
  }),

  computed: {
    imagePath: () => window.imagePath
  },

  created() {
    this.elementId = `user-${this.id}-${Math.random()}`
  }
}
</script>

<style scoped lang="scss">
::v-deep .popover-body {
  font-size: 1rem;
}

.username {
  cursor: help;
}
.bookcase-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  white-space: nowrap;

  img {
    height: 32px;
  }

  a:hover {
    border: none;
  }
}
</style>