<route lang="yaml">
alias: [/collection/abonnements]
</route>

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
            createSubscription(
              subscriptions!.find(
                ({ publicationcode }) =>
                  publicationcode ===
                  currentAssociatedPublication.referencePublicationcode
              )|| null,
              currentAssociatedPublication.publicationcode
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
      :key="subscription.id"
      :is-edit="editedSubscriptionId === subscription.id"
      :publicationcode="subscription.publicationcode"
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
      @edit="createSubscription(null, $event.publicationcode)"
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { BAlert, BButton, BCol, BRow } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection, SubscriptionTransformed } from "~/stores/collection";
import routes from "~types/routes";

type EditSubscription = {
  publicationcode: string;
  startDate: string | null;
  endDate: string | null;
};

type AssociatedPublication = {
  referencePublicationcode: string;
  publicationcode: string;
};

let hasPublicationNames = $ref(false as boolean);
let currentAssociatedPublications = $ref([] as AssociatedPublication[]);
const associatedPublications = $ref([
  {
    referencePublicationcode: "fr/JM",
    publicationcode: "fr/JMS",
  },
] as AssociatedPublication[]);
let editedSubscriptionId = $ref(undefined as number | undefined | null);

const publicationNames = $computed(() => coa().publicationNames);
const subscriptions = $computed(() => collection().subscriptions);
const fetchPublicationNames = coa().fetchPublicationNames;
const loadSubscriptions = collection().loadSubscriptions;

const createSubscription = async (
  existingSubscription: SubscriptionTransformed | null,
  publicationcode: string
) => {
  await routes["PUT /collection/subscriptions"](axios, {
    data: {
      existingSubscription,
      publicationcode,
    },
  });
  await loadSubscriptions(true);
  editedSubscriptionId = undefined;
};
const editSubscription = async (id: number, data: EditSubscription) => {
  await routes["POST /collection/subscriptions/:id"](axios, {
    urlParams: { id: String(id) },
    data,
  });
  await loadSubscriptions(true);
  editedSubscriptionId = undefined;
};
const deleteSubscription = async (id: number) => {
  await routes["DELETE /collection/subscriptions/:id"](axios, {
    urlParams: { id },
  });
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
            ({ publicationcode }) =>
              referencePublicationcode === publicationcode
          ) &&
          !newValue.find(
            ({ publicationcode }) =>
              associatedPublicationcode === publicationcode
          )
      );
      await fetchPublicationNames([
        ...associatedPublications.map(({ publicationcode }) => publicationcode),
        ...newValue.map(({ publicationcode }) => publicationcode),
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
