<route lang="yaml">
alias: [/collection/abonnements]
</route>

<template>
  <div v-if="subscriptions && hasPublicationNames">
    <b-alert variant="info" :model-value="true">
      {{
        $t(
          "Indiquez les magazines auxquels vous êtes abonné. DucksManager les ajoutera automatiquement à votre collection à leur sortie.",
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
          ],
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
      v-for="thisSubscription in subscriptions"
      :key="thisSubscription.id"
      :is-edit="currentSubscription?.id === thisSubscription.id"
      :subscription="thisSubscription"
      @start-edit="currentSubscription = thisSubscription"
      @cancel-edit="currentSubscription = null"
      @edit="editSubscription"
      @delete="deleteSubscription(thisSubscription.id)"
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
      :subscription="currentSubscription"
      is-edit
      @start-edit="currentSubscription = newSubscription"
      @cancel-edit="currentSubscription = null"
      @edit="createSubscription"
    />
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

import type { SubscriptionTransformedStringDates } from "~/stores/collection";
import type { subscription } from "~prisma-clients/schemas/dm";
type AssociatedPublication = {
  referencePublicationcode: string;
  publicationcode: string;
};

const { fetchPublicationNames } = coa();
const { publicationNames } = storeToRefs(coa());

const { loadSubscriptions } = collection();
const { subscriptions } = storeToRefs(collection());

const {
  collection: { services: collectionServices },
} = injectLocal(dmSocketInjectionKey)!;

const newSubscription = $ref({
  publicationcode: "fr/SPG",
  startDate: new Date(),
  endDate: dayjs(new Date()).add(1, "year").toDate(),
} as subscription);

let currentSubscription = $ref<subscription | null>(null);

let hasPublicationNames = $ref(false);
let currentAssociatedPublications = $ref<AssociatedPublication[]>([]);
const associatedPublications = $ref<AssociatedPublication[]>([
  {
    referencePublicationcode: "fr/JM",
    publicationcode: "fr/JMS",
  },
]);

const toSubscriptionWithStringDates = (
  subscription: subscription,
): SubscriptionTransformedStringDates => ({
  ...subscription,
  startDate: subscription.startDate.toISOString().split("Z")[0],
  endDate: subscription.endDate.toISOString().split("Z")[0],
});

const createSubscription = async (subscription: subscription) => {
  await collectionServices.createSubscription(
    toSubscriptionWithStringDates(subscription),
  );
  await loadSubscriptions(true);
  currentSubscription = null;
};

const createSubscriptionLike = async (
  associatedPublication: AssociatedPublication,
) => {
  await createSubscription({
    ...subscriptions.value!.find(
      ({ publicationcode }) =>
        publicationcode === associatedPublication.referencePublicationcode,
    )!,
    publicationcode: associatedPublication.publicationcode,
  });
};

const editSubscription = async (subscription: subscription) => {
  await collectionServices.updateSubscription(
    subscription.id,
    toSubscriptionWithStringDates(subscription),
  );
  await loadSubscriptions(true);
  currentSubscription = null;
};
const deleteSubscription = async (id: number) => {
  await collectionServices.deleteSubscription(id);
  await loadSubscriptions(true);
  currentSubscription = null;
};

watch(
  subscriptions,
  async (newValue) => {
    if (newValue) {
      currentAssociatedPublications = associatedPublications.filter(
        ({
          referencePublicationcode,
          publicationcode: associatedPublicationcode,
        }) =>
          newValue.find(
            ({ publicationcode }) =>
              referencePublicationcode === publicationcode,
          ) &&
          !newValue.find(
            ({ publicationcode }) =>
              associatedPublicationcode === publicationcode,
          ),
      );
      await fetchPublicationNames([
        ...associatedPublications.map(({ publicationcode }) => publicationcode),
        ...newValue.map(({ publicationcode }) => publicationcode),
      ]);
      hasPublicationNames = true;
    }
  },
  { immediate: true },
);

onMounted(() => {
  loadSubscriptions();
});
</script>
