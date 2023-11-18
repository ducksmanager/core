<route lang="yaml">
meta:
  public: true
</route>
<template>
  <div v-if="collection">
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
import { storeToRefs } from "pinia";

import { publicCollection } from "~/stores/public-collection";

const route = useRoute();
const username = $computed(() => route.params.username as string);
const publicationcode = $computed(() => (route.params.all as string) || null);

const { loadPublicCollection } = publicCollection();
const { mostPossessedPublication, collection } =
  storeToRefs(publicCollection());

watch(
  () => username,
  async (newUsername) => {
    if (newUsername) {
      await loadPublicCollection(username);
    }
  },
  { immediate: true },
);
</script>
