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
      v-for="contributor in bookcaseContributors"
      :key="JSON.stringify(contributor)"
      class="contributor"
    >
      <UserPopover
        v-if="'id' in contributor && stats[contributor.id]"
        :id="contributor.id"
        :stats="stats[contributor.id]"
        :points="points[contributor.id]"
      />
      <div v-else-if="'text' in contributor">
        {{ contributor.name }} {{ contributor.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchBookcaseContributors, fetchStats } = users();
const { bookcaseContributors, stats, points } = storeToRefs(users());

let loading = $ref(true);

(async () => {
  await fetchBookcaseContributors();
  await fetchStats(
    bookcaseContributors
      .value!.filter((user) => "id" in user)
      .map(({ id }) => id),
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
