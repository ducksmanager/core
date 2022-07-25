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
import { onMounted } from "vue";

import UserPopover from "../../components/UserPopover";
import { users } from "../../stores/users";

const usersStore = users();

let loading = $ref(true);
const bookcaseContributors = $computed(() => usersStore.bookcaseContributors),
  stats = $computed(() => usersStore.stats),
  points = $computed(() => usersStore.points),
  fetchStats = $computed(() => usersStore.fetchStats),
  fetchBookcaseContributors = $computed(
    () => usersStore.fetchBookcaseContributors
  ),
  bookcaseContributorsSorted = $computed(
    () =>
      !loading &&
      [...bookcaseContributors].sort(({ name: name1 }, { name: name2 }) =>
        Math.sign(name1.toLowerCase() - name2.toLowerCase())
      )
  );

onMounted(async () => {
  await fetchBookcaseContributors();
  await fetchStats(
    bookcaseContributors
      .filter(({ userId }) => !!userId)
      .map(({ userId }) => userId)
  );
  loading = false;
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
