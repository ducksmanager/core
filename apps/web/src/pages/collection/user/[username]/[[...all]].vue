<route lang="yaml">
alias: [/collection/user/:username]
meta:
  public: true
</route>
<template>
  <div v-if="issues">
    <ShortStats is-public>
      <template #empty-collection>
        <b-alert :model-value="true" variant="info" class="mb-3">
          {{ $t("La collection de {username} est vide.", { username }) }}
        </b-alert>
      </template>
      <template #non-empty-collection>
        <div class="mb-3">
          {{ $t("Cliquez sur l'un des magazines pour voir sa liste !") }}
        </div>
      </template>
    </ShortStats>
    <PublicationList is-public />
    <IssueList
      v-if="publicationcode || mostPossessedPublication"
      readonly
      :publicationcode="(publicationcode || mostPossessedPublication)!"
    />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute<"/collection/user/[username]/[[...all]]">();
const username = computed(() => route.params.username);
const publicationcode = computed(() => route.params.all);

const { loadPublicCollection } = publicCollection();
const { mostPossessedPublication, issues } = storeToRefs(publicCollection());

watch(
  username,
  async (newUsername) => {
    if (newUsername) {
      await loadPublicCollection(newUsername);
    }
  },
  { immediate: true },
);
</script>
