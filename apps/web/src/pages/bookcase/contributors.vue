<route lang="yaml">
alias: [/bibliotheque/contributeurs]
</route>

<template>
  <div v-if="loading">
    {{ $t("Chargement...") }}
  </div>
  <div v-else id="contributors">
    <h2>
      {{
        $t(
          "La bibliothèque DucksManager n'aurait pas pu voir le jour sans le soutien et l'aide de :",
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

<script setup lang="ts">
const { fetchBookcaseContributors, fetchStats } = users();
const { bookcaseContributors, stats, points } = storeToRefs(users());

let loading = $ref(true);
const bookcaseContributorsSorted = $computed(
  () =>
    (!loading &&
      [...bookcaseContributors.value!].sort(
        ({ name: name1 }, { name: name2 }) =>
          name1.toLowerCase().localeCompare(name2.toLowerCase()),
      )) ||
    [],
);

(async () => {
  await fetchBookcaseContributors();
  await fetchStats(
    bookcaseContributors
      .value!.filter(({ userId }) => typeof userId === "number")
      .map(({ userId }) => userId as number),
  );
  loading = false;
})();
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
