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
    </ShortStats>
    <PublicationList is-public />
    <IssueList
      v-if="collectionUserPublicationcode || mostPossessedPublication"
      readonly
      :publicationcode="(collectionUserPublicationcode || mostPossessedPublication) as string"
    />
  </div>
</template>

<script lang="ts" setup>
const collectionUserRoute =
  useRoute<"/collection/user/[username]/[[...all]]">();
const username = computed(() => collectionUserRoute.params.username);
const collectionUserPublicationcode = computed(
  () => collectionUserRoute.params.all as string,
);

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
