<template>
  <div v-if="loading">
    {{ $t("Chargement...") }}
  </div>
  <div
    v-else
    id="contributors"
  >
    <h2>{{ $t("La bibliothèque DucksManager n'aurait pas pu voir le jour sans le soutien et l'aide de :") }}</h2>
    <div
      v-for="contributor in bookcaseContributorsSorted"
      :key="JSON.stringify(contributor)"
      class="contributor"
    >
      <UserPopover
        v-if="contributor.userId && stats[contributor.userId]"
        :id="contributor.userId"
        :stats="stats[contributor.userId]"
        :points="points[contributor.userId]"
      />
      <div v-else-if="contributor.text">
        {{ contributor.name }} {{ contributor.text }}
      </div>
    </div>
  </div>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import { mapActions, mapState } from "vuex";
import UserPopover from "../../components/UserPopover";

export default {
  name: "BookcaseContributors",

  components: {
    UserPopover
  },
  mixins: [l10nMixin],

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapState("users", ["bookcaseContributors", "stats", "points"]),

    bookcaseContributorsSorted() {
      return !this.loading && [...this.bookcaseContributors]
        .sort(({ name: name1 }, { name: name2 }) => name1.toLowerCase() < name2.toLowerCase() ? -1 : 1);
    }
  },

  async mounted() {
    await this.fetchBookcaseContributors();
    await this.fetchStats(
      this.bookcaseContributors.filter(({ userId }) => !!userId).map(({ userId }) => userId)
    );
    this.loading = false;
  },

  methods: {
    ...mapActions("users", ["fetchStats", "fetchBookcaseContributors"])
  }
};
</script>

<style lang="scss" scoped>
#contributors {
  border: 1px solid white;

  h2 {
    text-align: center;
  }

  .contributor {
    padding-left: 10px;
    font-size: 18px;
    line-height: 22px;
  }
}
</style>
