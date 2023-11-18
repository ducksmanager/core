<template>
  <v-contextmenu-group :title="$t('Etat')">
    <v-contextmenu-item
      v-for="{ labelContextMenu, value } in conditionStates"
      :key="`condition-${value}`"
      :hide-on-click="false"
      class="clickable"
      :class="{ selected: newCopyState.condition === value }"
      @click="newCopyState.condition = value"
    >
      <template v-if="value === undefined" />
      <Condition v-else :value="value || undefined" />&nbsp;{{
        labelContextMenu
      }}
    </v-contextmenu-item>
    <v-contextmenu-divider v-show="newCopyState.condition !== null" />
  </v-contextmenu-group>
  <v-contextmenu-group
    v-show="newCopyState.condition !== null"
    :title="$t('Pile de lecture')"
  >
    <v-contextmenu-item
      v-for="{ label: stateText, value: stateId } in toReadStates"
      :key="`copy-to-read-state-${String(stateId)}`"
      :hide-on-click="false"
      :class="`clickable read-state ${stateId} ${
        newCopyState.isToRead === stateId ? 'selected' : ''
      }`"
      @click="
        newCopyState.isToRead =
          stateId === undefined ? undefined : stateId === true
      "
    >
      <i-bi-bookmark-check v-if="stateId === true" />
      <i-bi-bookmark-x v-if="stateId === false" />
      {{ stateText }}
    </v-contextmenu-item>
    <v-contextmenu-divider v-show="newCopyState.condition !== null" />
  </v-contextmenu-group>
  <template v-if="newCopyState.condition !== null">
    <v-contextmenu-group :title="$t('Date d\'achat')">
      <template
        v-for="{ label: stateText, value: stateId } in purchaseStates"
        :key="`copy-${copyState.copyIndex}-purchase-state-${stateId}`"
      >
        <template v-if="isSingleIssueSelected && stateId === undefined" />
        <v-contextmenu-item
          v-else-if="stateId === undefined || stateId === null"
          :hide-on-click="false"
          class="clickable purchase-state"
          :class="{
            selected: newCopyState.purchaseId === stateId,
            'v-context__sub': String(stateId) === 'link',
            [`state-${stateId}`]: true,
          }"
          @click="
            newCopyState.purchaseId =
              stateId === null ? -1 : (stateId as undefined | number | null)
          "
        >
          <i-bi-calendar-x v-if="stateId === null" />
          {{ stateText }}
        </v-contextmenu-item>
        <v-contextmenu-submenu
          v-else
          :title="$t(`Date d'achat`)"
          @mouseleave.prevent="() => {}"
        >
          <template #title>
            <i-bi-calendar v-if="typeof stateId === 'number'" />
            {{ stateText }}
          </template>
          <v-contextmenu-group :title="$t('Date d\'achat')">
            <v-contextmenu-item
              v-if="!newPurchase.context"
              :hide-on-click="false"
              class="clickable"
              @click.stop="
                newPurchase.context = !newPurchase.context;
                newPurchase.date = today;
              "
            >
              <b>{{ $t("Nouvelle date d'achat...") }}</b>
            </v-contextmenu-item>
            <v-contextmenu-item
              v-else
              class="purchase-date"
              @click.stop="() => {}"
            >
              <b-form-input
                v-model="newPurchase.date"
                type="text"
                lazy-formatter
                :formatter="formatDate"
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                required
                class="form-control date px-0"
                maxlength="10"
                :placeholder="$t(`Date d'achat`)"
                @click.stop="() => {}"
              />
              <input
                v-model="newPurchase.description"
                required
                type="text"
                class="form-control text-center"
                maxlength="30"
                :placeholder="$t('Description')"
                @click.stop="() => {}"
              />
              <b-button
                variant="success"
                class="btn-sm"
                @click.stop="
                  createPurchase({
                    date: newPurchase.date!,
                    description: newPurchase.description!,
                  });
                  newPurchase = newPurchaseDefault;
                "
              >
                <i-bi-check />
              </b-button>
              <b-button
                variant="warning"
                class="btn-sm"
                @click.stop="newPurchase.context = false"
              >
                <i-bi-x />
              </b-button>
            </v-contextmenu-item>
            <v-contextmenu-item
              v-for="{ id, date, description } in purchases"
              :key="`copy-purchase-${id}`"
              :hide-on-click="false"
              class="clickable purchase-date"
              :class="{
                selected: newCopyState.purchaseId === id,
              }"
              @click.stop="newCopyState.purchaseId = id"
            >
              <small class="date">{{ date }}</small>
              <div class="mx-2">
                {{ description }}
              </div>
              <b-button
                class="delete-purchase btn-sm"
                :title="$t('Supprimer')"
                @click="deletePurchase(id)"
              >
                <i-bi-trash />
              </b-button>
            </v-contextmenu-item>
          </v-contextmenu-group>
        </v-contextmenu-submenu>
      </template>
    </v-contextmenu-group>
    <v-contextmenu-group :title="$t('Marketplace')">
      <template
        v-for="{
          value: stateId,
          text: stateText,
          tooltip,
          disabled,
        } in marketplaceStates"
        :key="`copy-${copyState.copyIndex}-marketplace-state-${
          JSON.stringify(stateId) || stateId
        }`"
      >
        <v-contextmenu-item
          v-if="
            typeof stateId === 'boolean' || stateId === undefined || disabled
          "
          :hide-on-click="false"
          class="marketplace-state"
          :class="{
            clickable: !disabled,
            disabled,
            selected: newCopyState.isOnSale === stateId,
            [`state-${stateId}`]: true,
          }"
          @click="
            newCopyState.isOnSale = disabled
              ? newCopyState.isOnSale
              : stateId === undefined
                ? undefined
                : stateId === true
          "
        >
          <i-bi-cart v-if="stateId === true" />
          <i-bi-cart-x v-if="stateId === false" />
          <i-bi-lock
            v-if="
              disabled &&
              typeof newCopyState.isOnSale === 'object' &&
              'setAsideFor' in newCopyState.isOnSale
            "
          />
          <i-bi-arrow-bar-right
            v-if="
              disabled &&
              typeof newCopyState.isOnSale === 'object' &&
              'transferTo' in newCopyState.isOnSale
            "
          />

          <span :title="tooltip">{{ stateText }}</span>
        </v-contextmenu-item>
        <v-contextmenu-submenu
          v-else
          :title="stateText"
          class="cursor-help"
          :class="{
            clickable: true,
            selected:
              typeof newCopyState.isOnSale === 'object' &&
              Object.keys(stateId)[0] in newCopyState.isOnSale,
          }"
          @mouseleave.prevent="() => {}"
        >
          <template #title>
            <i-bi-lock v-if="'setAsideFor' in stateId" />
            <i-bi-arrow-bar-right v-if="'transferTo' in stateId" />
            <div :title="tooltip">{{ stateText }}</div>
          </template>
          <v-contextmenu-group :title="stateText">
            <v-contextmenu-item
              v-for="userId in userIdsWhoSentRequestsForAllSelected"
              :key="`copy-${stateId}-user-id-${userId}`"
              :hide-on-click="false"
              class="clickable"
              :class="{
                selected:
                  typeof newCopyState.isOnSale === 'object' &&
                  ((Object.keys(stateId)[0] === 'transferTo' &&
                    'transferTo' in newCopyState.isOnSale &&
                    newCopyState.isOnSale.transferTo === userId) ||
                    (Object.keys(stateId)[0] === 'setAsideFor' &&
                      'setAsideFor' in newCopyState.isOnSale &&
                      newCopyState.isOnSale.setAsideFor === userId)),
              }"
              @click.prevent="
                newCopyState.isOnSale =
                  typeof stateId === 'object' && 'transferTo' in stateId
                    ? { transferTo: userId }
                    : { setAsideFor: userId }
              "
              >{{ buyerUserNamesById?.[userId] }}</v-contextmenu-item
            >
          </v-contextmenu-group>
        </v-contextmenu-submenu></template
      >
    </v-contextmenu-group>
  </template>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

import cond from "~/composables/useCondition";
import {
  collection as collectionStore,
  IssueWithPublicationcodeOptionalId,
} from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";
import { CollectionUpdateMultipleIssues } from "~dm-types/CollectionUpdate";
import { issue_condition } from "~prisma-clients/client_dm";

const { conditions } = cond();

const { copy: copyState, copyIndex = null } = defineProps<{
  copy: IssueWithPublicationcodeOptionalId | CollectionUpdateMultipleIssues;
  copyIndex?: number | null;
}>();

let newCopyState = $ref(
  copyState as
    | IssueWithPublicationcodeOptionalId
    | CollectionUpdateMultipleIssues,
);

const emit = defineEmits<{
  (
    e: "update",
    updatedCopy:
      | IssueWithPublicationcodeOptionalId
      | CollectionUpdateMultipleIssues,
  ): void;
}>();

const today = new Date().toISOString().slice(0, 10);

type NewPurchase = {
  description?: string;
  date?: string;
  context?: boolean;
};

const newPurchaseDefault: NewPurchase = {
  description: "",
  date: today,
  context: false,
};

let newPurchase = $ref(newPurchaseDefault);

const { t: $t } = useI18n();
const isSaleDisabledGlobally = $computed(
  () => !userIdsWhoSentRequestsForAllSelected.length,
);

const purchases = $computed(() => collectionStore().purchases);

const issuenumbers = $computed(() =>
  isSingleIssueSelected
    ? [(copyState as IssueWithPublicationcodeOptionalId).issuenumber]
    : (copyState as CollectionUpdateMultipleIssues).issuenumbers,
);

const collectionForCurrentPublication = $computed(
  () =>
    collectionStore().collection?.filter(
      ({ publicationcode: issuePublicationcode }) =>
        copyState.publicationcode === issuePublicationcode,
    ),
);

let isSingleIssueSelected = $computed(() => "copyIndex" in copyState);

const conditionStates = $computed(
  (): {
    value: issue_condition | null | undefined;
    labelContextMenu: string;
  }[] => [
    {
      value: undefined,
      labelContextMenu: $t("Conserver l'état actuel"),
    },
    ...conditions.map(({ value, labelContextMenu }) => ({
      value,
      labelContextMenu,
    })),
  ],
);
const purchaseStates = $computed(() => [
  { value: undefined, label: $t("Conserver la date d'achat") },
  { value: 0, label: $t("Associer avec une date d'achat") },
  { value: null, label: $t("Ne pas associer avec une date d'achat") },
]);
const toReadStates = $computed(() => [
  { value: undefined, label: $t("Conserver la pile de lecture") },
  { value: true, label: $t("Inclus dans la pile de lecture") },
  { value: false, label: $t("Exclus de la pile de lecture") },
]);
const marketplaceStates = $computed(() => [
  { value: undefined, text: $t("Ne rien changer"), disabled: false },
  { value: false, text: $t("Ne pas marquer comme à vendre"), disabled: false },
  { value: true, text: $t("Marquer comme à vendre"), disabled: false },
  {
    value: { setAsideFor: null },
    text: $t("Réserver pour"),
    disabled: isSaleDisabledGlobally,
    tooltip: isSaleDisabledGlobally
      ? $t(
          "Aucun utilisateur n'a envoyé de demande pour acheter ce numéro pour le moment | Aucun utilisateur n'a envoyé de demande pour acheter ces numéros pour le moment",
        )
      : $t(
          "Réservez ce numéro à un utilisateur dans le but de les lui envoyer plus tard. Les autres utilisateurs ne pourront plus vous envoyer de demandes d'achat pour ce numéros. | Réservez ces numéros à un utilisateur dans le but de les lui envoyer plus tard. Les autres utilisateurs ne pourront plus vous envoyer de demandes d'achat pour ces numéros.",
        ),
  },
  {
    value: { transferTo: null },
    text: $t("Transférer à"),
    disabled: isSaleDisabledGlobally,
    tooltip: isSaleDisabledGlobally
      ? $t(
          "Aucun utilisateur n'a envoyé de demande pour acheter ce numéro pour le moment | Aucun utilisateur n'a envoyé de demande pour acheter ces numéros pour le moment",
        )
      : $t(
          "Transférez ce numéro à un utilisateur avec qui vous avez négocié une vente ou un échange | Transférez ces numéros à un utilisateur avec qui vous avez négocié une vente ou un échange",
        ),
  },
]);

const userIdsWhoSentRequestsForAllSelected = $computed(() =>
  issueIds.reduce(
    (acc, issueId, idx) =>
      idx === 0
        ? [
            ...new Set(
              (receivedRequests || [])
                .filter(
                  ({ issueId: receivedRequestIssueId }) =>
                    receivedRequestIssueId === issueId,
                )
                .map(({ buyerId }) => buyerId),
            ),
          ]
        : acc.filter((buyerId) =>
            (receivedRequests || []).filter(
              ({
                issueId: receivedRequestIssueId,
                buyerId: receivedRequestBuyerId,
              }) =>
                receivedRequestIssueId === issueId &&
                receivedRequestBuyerId === buyerId,
            ),
          ),
    [] as number[],
  ),
);

const buyerUserNamesById = $computed(() => marketplace().buyerUserNamesById);

const receivedRequests = $computed(
  () =>
    marketplace().issueRequestsAsSeller?.filter(({ issueId }) =>
      issueIds.includes(issueId),
    ),
);

const formatDate = (value: string) =>
  /\d{4}-\d{2}-\d{2}/.test(value) ? value : today;

const issueIds = $computed((): (number | null)[] =>
  issuenumbers && collectionForCurrentPublication
    ? isSingleIssueSelected
      ? [
          collectionForCurrentPublication
            ?.filter(({ issuenumber }) => issuenumber === issuenumbers[0])
            .find((_, currentCopyIndex) => copyIndex === currentCopyIndex!)
            ?.id || null,
        ]
      : collectionForCurrentPublication
          ?.filter(({ issuenumber }) => issuenumbers.includes(issuenumber))
          .map(({ id }) => id || null)
    : [] || [],
);

const createPurchase = async (data: { date: string; description: string }) => {
  await collectionStore().createPurchase(data.date, data.description);
};
const deletePurchase = async (id: number) => {
  await collectionStore().deletePurchase(id);
};

watch(
  () => copyState,
  (copyState) => {
    newCopyState = copyState;
  },
  { immediate: true },
);
watch(
  () => newCopyState,
  (newCopyState) => {
    emit("update", newCopyState);
  },
  { deep: true },
);
watch(
  () => marketplace().issueRequestsAsSeller,
  (newValue) => {
    const buyerId = newValue?.find(
      ({ issueId, isBooked }) =>
        issueId === (copyState as IssueWithPublicationcodeOptionalId).id &&
        isBooked,
    )?.buyerId;
    if (buyerId) {
      newCopyState.isOnSale = { setAsideFor: buyerId };
    }
  },
  { immediate: true },
);
</script>
