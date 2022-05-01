<template>
  <div v-if="loading">
    {{ $t("Chargement...") }}
  </div>
  <div v-else id="contributors">
    <h2>
      {{
        $t(
          "La bibliothèque DucksManager n'aurait pas pu voir le jour sans le soutien et l'aide de :"
        )
      }}
    </h2>
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

<script setup>
import UserPopover from "../../components/UserPopover";
import { users } from "../../stores/users";
import { computed, onMounted, ref } from "vue";

const usersStore = users();

const loading = ref(true),
  bookcaseContributors = usersStore.bookcaseContributors,
  stats = usersStore.stats,
  points = usersStore.points,
  fetchStats = usersStore.fetchStats,
  fetchBookcaseContributors = usersStore.fetchBookcaseContributors,
  bookcaseContributorsSorted = computed(
    () =>
      !loading.value &&
      [...bookcaseContributors.value].sort(({ name: name1 }, { name: name2 }) =>
        name1.toLowerCase() < name2.toLowerCase() ? -1 : 1
      )
  );

onMounted(async () => {
  await fetchBookcaseContributors();
  await fetchStats(
    bookcaseContributors.value
      .filter(({ userId }) => !!userId)
      .map(({ userId }) => userId)
  );
  loading.value = false;
});
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
