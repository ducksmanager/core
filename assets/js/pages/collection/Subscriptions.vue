<template>
  <div v-if="subscriptions && hasPublicationNames">
    <b-alert variant="info" show>
      {{
        $t(
          "Indiquez les magazines auxquels vous êtes abonné. DucksManager les ajoutera automatiquement à votre collection à leur sortie."
        )
      }}
    </b-alert>
    <b-row>
      <b-col sm="8" md="4">
        <h4>{{ $t("Mes abonnements") }}</h4>
      </b-col>
    </b-row>
    <div v-if="!subscriptions.length">
      {{ $t("Aucun abonnement") }}
    </div>
    <b-alert
      v-for="(
        currentAssociatedPublication, idx
      ) in currentAssociatedPublications"
      :key="`associated-pub-${JSON.stringify(currentAssociatedPublication)}`"
      show
      variant="info"
    >
      {{
        $t(
          "Vous avez indiqué avoir un abonnement pour {0}. Généralement, cet abonnement inclut également la réception du magazine {1}. Voulez-vous ajouter un abonnement à {1} pour les mêmes dates ?",
          [
            publicationNames[
              currentAssociatedPublication.referencePublicationcode
            ],
            publicationNames[currentAssociatedPublication.publicationcode],
            publicationNames[currentAssociatedPublication.publicationcode],
          ]
        )
      }}
      <p>
        <b-button
          @click="
            createAssociatedPublicationSubscription(
              subscriptions.find(
                ({ publicationCode }) =>
                  publicationCode ===
                  currentAssociatedPublication.referencePublicationcode
              ),
              currentAssociatedPublication
            )
          "
        >
          {{ $t("Oui") }}
        </b-button>
        <b-button @click="currentAssociatedPublications.splice(idx, 1)">
          {{ $t("Non") }}
        </b-button>
      </p>
    </b-alert>
    <Subscription
      v-for="subscription in subscriptions"
      :id="subscription.id"
      :key="subscription.id"
      :is-edit="editedSubscriptionId === subscription.id"
      :publication-code="subscription.publicationCode"
      :start-date="subscription.startDate"
      :end-date="subscription.endDate"
      @start-edit="editedSubscriptionId = subscription.id"
      @cancel-edit="editedSubscriptionId = undefined"
      @edit="editSubscription(subscription.id, $event)"
      @delete="deleteSubscription(subscription.id)"
    />
    <b-row v-if="editedSubscriptionId !== null" class="mt-3 align-items-center">
      <b-col>
        <b-button
          class="mt-4"
          :disabled="editedSubscriptionId !== undefined"
          @click="editedSubscriptionId = null"
        >
          {{ $t("Ajouter un abonnement") }}
        </b-button>
      </b-col>
    </b-row>
    <Subscription
      v-if="editedSubscriptionId === null"
      :is-edit="editedSubscriptionId === null"
      @start-edit="editedSubscriptionId = null"
      @cancel-edit="editedSubscriptionId = undefined"
      @edit="createSubscription($event)"
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>
<script setup>
import axios from "axios";
import { BAlert, BButton, BCol, BRow } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";

import Subscription from "../../../../components/Subscription";
import { coa } from "../../../../stores/coa";
import { collection } from "../../../../stores/collection";

let hasPublicationNames = $ref(false);
let currentAssociatedPublications = $ref([]);
const associatedPublications = $ref([
  {
    referencePublicationcode: "fr/JM",
    publicationcode: "fr/JMS",
  },
]);
let editedSubscriptionId = $ref(undefined);
let newSubscription = $ref(null);

const publicationNames = $computed(() => coa().publicationNames);
const subscriptions = $computed(() => collection().subscriptions);
const fetchPublicationNames = coa().fetchPublicationNames;
const loadSubscriptions = collection().loadSubscriptions;
const createAssociatedPublicationSubscription = (
  existingSubscription,
  { publicationcode: associatedPublicationcode }
) => {
  newSubscription = {
    ...existingSubscription,
    publicationCode: associatedPublicationcode,
  };
  createSubscription(newSubscription);
};
const createSubscription = async (data) => {
  await axios.put(`/api/collection/subscriptions`, data);
  await loadSubscriptions(true);
  editedSubscriptionId = undefined;
};
const editSubscription = async (id, data) => {
  await axios.post(`/api/collection/subscriptions/${id}`, data);
  await loadSubscriptions(true);
  editedSubscriptionId = undefined;
};
const deleteSubscription = async (id) => {
  await axios.delete(`/api/collection/subscriptions/${id}`);
  await loadSubscriptions(true);
  editedSubscriptionId = undefined;
};

watch(
  () => subscriptions,
  async (newValue) => {
    if (newValue) {
      currentAssociatedPublications = associatedPublications.filter(
        ({
          referencePublicationcode,
          publicationcode: associatedPublicationcode,
        }) =>
          newValue.find(
            ({ publicationCode }) =>
              referencePublicationcode === publicationCode
          ) &&
          !newValue.find(
            ({ publicationCode }) =>
              associatedPublicationcode === publicationCode
          )
      );
      await fetchPublicationNames([
        ...associatedPublications.map(({ publicationcode }) => publicationcode),
        ...subscriptions.map(({ publicationCode }) => publicationCode),
      ]);
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadSubscriptions();
});
</script>
<style scoped>
</style>
