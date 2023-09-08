<route lang="yaml">
alias: [/collection/abonnements]
</route>

<template>
  <div v-if="subscriptions && hasPublicationNames">
    <b-alert variant="info" :model-value="true">
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
      :model-value="true"
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
        <b-button @click="createSubscriptionLike(currentAssociatedPublication)">
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
      :is-edit="currentSubscription?.id === subscription.id"
      :subscription="subscription"
      @start-edit="
        currentSubscription = toSubscriptionWithStringDates(subscription)
      "
      @cancel-edit="currentSubscription = null"
      @edit="editSubscription($event)"
      @delete="deleteSubscription(subscription.id)"
    />
    <b-row v-if="currentSubscription === null" class="mt-3 align-items-center">
      <b-col>
        <b-button class="mt-4" @click="currentSubscription = newSubscription">
          {{ $t("Ajouter un abonnement") }}
        </b-button>
      </b-col>
    </b-row>
    <Subscription
      v-if="currentSubscription && currentSubscription.id === null"
      :subscription="currentSubscription!"
      is-edit
      @start-edit="currentSubscription = newSubscription"
      @cancel-edit="currentSubscription = null"
      @edit="createSubscription($event)"
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
import {
  DELETE__collection__subscriptions__$id,
  POST__collection__subscriptions__$id,
  PUT__collection__subscriptions,
} from "api-routes";
import axios from "axios";
import { EditSubscription } from "types/EditSubscription";
import { onMounted, watch } from "vue";

import { coa } from "~/stores/coa";
import { collection, SubscriptionTransformed } from "~/stores/collection";
import { call } from "~/util/axios";

type AssociatedPublication = {
  referencePublicationcode: string;
  publicationcode: string;
};

const newSubscription = $ref({
  id: null,
  publicationcode: null,
  startDate: null,
  endDate: null,
} as EditSubscription);

let currentSubscription = $ref(null as EditSubscription | null);

let hasPublicationNames = $ref(false as boolean);
let currentAssociatedPublications = $ref([] as AssociatedPublication[]);
const associatedPublications = $ref([
  {
    referencePublicationcode: "fr/JM",
    publicationcode: "fr/JMS",
  },
] as AssociatedPublication[]);

const publicationNames = $computed(() => coa().publicationNames);
const subscriptions = $computed(() => collection().subscriptions);
const fetchPublicationNames = coa().fetchPublicationNames;
const loadSubscriptions = collection().loadSubscriptions;

const createSubscription = async (subscription: SubscriptionTransformed) => {
  await call(
    axios,
    new PUT__collection__subscriptions({
      reqBody: {
        subscription: {
          ...subscription,
          startDate: subscription.startDate.toISOString().split("Z")[0],
          endDate: subscription.endDate.toISOString().split("Z")[0],
        },
      },
    })
  );
  await loadSubscriptions(true);
  currentSubscription = null;
};

const createSubscriptionLike = async (
  associatedPublication: AssociatedPublication
) => {
  await createSubscription({
    ...subscriptions!.find(
      ({ publicationcode }) =>
        publicationcode === associatedPublication.referencePublicationcode
    )!,
    publicationcode: associatedPublication.publicationcode,
  });
};

const editSubscription = async (subscription: EditSubscription) => {
  await call(
    axios,
    new POST__collection__subscriptions__$id({
      reqBody: { subscription },
      params: { id: String(subscription.id) },
    })
  );
  await loadSubscriptions(true);
  currentSubscription = null;
};
const deleteSubscription = async (id: number) => {
  await call(
    axios,
    new DELETE__collection__subscriptions__$id({
      params: { id: String(id) },
    })
  );
  await loadSubscriptions(true);
  currentSubscription = null;
};

const toSubscriptionWithStringDates = (
  subscription: SubscriptionTransformed
): EditSubscription => ({
  ...subscription,
  startDate: subscription.startDate.toISOString().split("Z")[0],
  endDate: subscription.endDate.toISOString().split("Z")[0],
});

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
