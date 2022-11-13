<template>
  <v-contextmenu-group>
    <li class="header">
      {{
        $t(
          "{count} numéro sélectionné|{count} numéros sélectionnés",
          Object.keys(selectedIssuesById).length
        )
      }}
    </li>
    <BAlert
      v-if="!editingCopies.length"
      class="text-center m-0"
      show
      variant="danger"
    >
      {{
        $t("Vous allez retirer tous les exemplaires\ndes numéros sélectionnés")
      }}
    </BAlert>
    <BAlert
      v-if="copies.length && !isSingleIssueSelected"
      class="text-center m-0"
      show
      variant="warning"
    >
      {{
        $t(
          "Vous possédez certains numéros sélectionnés\nen plusieurs exemplaires.\nSeul le premier exemplaire sera modifié."
        )
      }}
    </BAlert>
    <BAlert
      v-if="!Object.keys(selectedIssuesById).length"
      class="text-center m-0"
      show
      variant="warning"
    >
      {{
        $t(
          "Sélectionnez un ou plusieurs numéros dans la liste\npour les ajouter, modifier ou supprimer de votre collection."
        )
      }}
    </BAlert>
    <template v-else>
      <BTabs
        v-model.number="currentCopyIndex"
        nav-class="copies-tabs"
        @changed="
          (newTabs) => {
            currentCopyIndex = newTabs.length - 1;
          }
        "
      >
        <BTab
          v-for="(copy, copyIndex) in editingCopies"
          :key="`copy-${copyIndex}`"
        >
          <template #title>
            {{ $t("Exemplaire") }} {{ copyIndex + 1 }}
            <BIconTrash
              @click.stop.prevent="editingCopies.splice(copyIndex, 1)"
            />
          </template>
          <v-contextmenu-group :title="$t('Etat')">
            <v-contextmenu-item
              v-for="(stateText, stateId) in conditionStates"
              :key="`condition-${stateId}`"
              :hide-on-click="false"
              class="clickable"
              :class="{ selected: copy.condition === stateId }"
              @click="copy.condition = stateId"
            >
              <Condition :value="stateId" />&nbsp;{{ stateText }}
            </v-contextmenu-item>
            <v-contextmenu-divider v-show="copy.condition !== 'missing'" />
          </v-contextmenu-group>
          <v-contextmenu-group
            v-show="copy.condition !== 'missing'"
            :title="$t('Pile de lecture')"
          >
            <v-contextmenu-item
              v-for="(stateText, stateId) in toReadStates"
              :key="`copy-${copyIndex}-to-read-state-${stateId}`"
              :hide-on-click="false"
              class="clickable read-state"
              :class="{
                selected: String(copy.isToRead) === stateId,
                [stateId]: true,
              }"
              @click="
                copy.isToRead =
                  stateId === 'do_not_change' ? null : stateId === 'true'
              "
            >
              <BIconBookmarkCheck v-if="stateId === 'true'" />
              <BIconBookmarkX v-if="stateId === 'false'" />
              {{ stateText }}
            </v-contextmenu-item>
            <v-contextmenu-divider v-show="copy.condition !== 'missing'" />
          </v-contextmenu-group>
          <template v-if="copy.condition !== 'missing'">
            <v-contextmenu-group :title="$t('Date d\'achat')">
              <template
                v-for="(stateText, stateId) in purchaseStates"
                :key="`copy-${copyIndex}-purchase-state-${stateId}`"
              >
                <v-contextmenu-item
                  v-if="stateId !== 'link'"
                  :hide-on-click="false"
                  class="clickable purchase-state"
                  :class="{
                    selected: copy.purchaseId === stateId,
                    'v-context__sub': stateId === 'link',
                    [stateId]: true,
                  }"
                  @click="copy.purchaseId = stateId"
                >
                  <BIconCalendarX v-if="stateId === 'unlink'" />
                  {{ stateText }}
                </v-contextmenu-item>
                <v-contextmenu-submenu
                  v-else
                  :title="$t(`Date d'achat`)"
                  @mouseleave.prevent="() => {}"
                >
                  <template #title>
                    <BIconCalendar v-if="stateId === 'link'" />
                    {{ stateText }}
                  </template>
                  <v-contextmenu-group :title="$t('Date d\'achat')">
                    <v-contextmenu-item
                      v-if="!copy.newPurchaseContext"
                      :hide-on-click="false"
                      class="clickable"
                      @click.stop="
                        copy.newPurchaseContext = !copy.newPurchaseContext;
                        copy.newPurchaseDate = today;
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
                        v-model="copy.newPurchaseDate"
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
                        v-model="copy.newPurchaseDescription"
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
                            date: copy.newPurchaseDate,
                            description: copy.newPurchaseDescription,
                          });
                          copy.newPurchaseDescription = '';
                          copy.newPurchaseDate = today;
                          copy.newPurchaseContext = false;
                        "
                      >
                        <BIconCheck icon="check" />
                      </b-button>
                      <b-button
                        variant="warning"
                        class="btn-sm"
                        @click.stop="copy.newPurchaseContext = false"
                      >
                        <BIconX icon="x" />
                      </b-button>
                    </v-contextmenu-item>
                    <v-contextmenu-item
                      v-for="{ id: purchaseId, date, description } in purchases"
                      :key="`copy-${copyIndex}-purchase-${purchaseId}`"
                      :hide-on-click="false"
                      class="clickable purchase-date"
                      :class="{
                        selected: copy.purchaseId === purchaseId,
                      }"
                      @click.stop="copy.purchaseId = purchaseId"
                    >
                      <small class="date">{{ date }}</small>
                      <div class="mx-2">
                        {{ description }}
                      </div>
                      <b-button
                        class="delete-purchase btn-sm"
                        :title="$t('Supprimer')"
                        @click="
                          deletePurchase({
                            id: purchaseId,
                          })
                        "
                      >
                        <BIconTrash />
                      </b-button>
                    </v-contextmenu-item>
                  </v-contextmenu-group>
                </v-contextmenu-submenu>
              </template>
            </v-contextmenu-group>
            <v-contextmenu-group :title="$t('Marketplace')">
              <template
                v-for="(
                  { text: stateText, tooltip, isSaleDisabled }, stateId
                ) in marketplaceStates"
                :key="`copy-${copyIndex}-marketplace-state-${stateId}`"
              >
                <v-contextmenu-item
                  v-if="
                    ['true', 'false', 'do_not_change'].includes(stateId) ||
                    isSaleDisabled
                  "
                  :hide-on-click="false"
                  class="marketplace-state"
                  :class="{
                    clickable: ['true', 'false', 'do_not_change'].includes(
                      stateId
                    ),
                    disabled: isSaleDisabled,
                    selected: String(copy.isOnSale) === stateId,
                    [stateId]: true,
                  }"
                  @click="
                    copy.isOnSale = isSaleDisabled
                      ? copy.isOnSale
                      : stateId === 'do_not_change'
                      ? null
                      : stateId === 'true'
                  "
                >
                  <BIconCart v-if="stateId === 'true'" />
                  <BIconCartX v-if="stateId === 'false'" />
                  <BIconLock v-if="stateId === 'setAside'" />
                  <BIconArrowBarRight v-if="stateId === 'transfer'" />
                  <BIconChat v-if="stateId === 'contact'" />

                  <span :title="tooltip">{{ stateText }}</span>
                </v-contextmenu-item>
                <v-contextmenu-submenu
                  v-else
                  :title="stateText"
                  class="cursor-help"
                  @mouseleave.prevent="() => {}"
                >
                  <template #title>
                    <BIconLock v-if="stateId === 'setAside'" />
                    <BIconArrowBarRight v-if="stateId === 'transfer'" />
                    <BIconChat v-if="stateId === 'contact'" />
                    <span :title="tooltip">{{ stateText }}</span>
                  </template>
                  <v-contextmenu-group :title="stateText">
                    <v-contextmenu-item
                      v-for="userId in userIdsWhoSentRequestsForAllSelected"
                      :key="`copy-${copyIndex}-user-id-${userId}`"
                      :hide-on-click="false"
                      class="clickable"
                      >{{ buyerUserNamesById?.[userId] }}</v-contextmenu-item
                    >
                  </v-contextmenu-group>
                </v-contextmenu-submenu></template
              >
            </v-contextmenu-group></template
          >
        </BTab>
        <template v-if="!hasMaxCopies" #tabs-end>
          <BNavItem
            v-if="isSingleIssueSelected || hasNoCopies"
            class="p-0"
            role="presentation"
            @click.prevent="editingCopies.push({ ...defaultState })"
          >
            {{ $t("Ajouter un exemplaire") }}
          </BNavItem>
          <BNavItem
            v-else
            class="p-0 disabled text-secondary"
            role="presentation"
            :title="
              $t(
                `Vous pouvez seulement ajouter un exemplaire lorsqu'un seul numéro est sélectionné`
              )
            "
          >
            {{ $t("Ajouter un exemplaire") }}
          </BNavItem>
        </template>
      </BTabs>
      <li class="footer clickable" @click="updateSelectedIssues">
        {{ $t("Enregistrer les changements") }}
      </li>
    </template>
  </v-contextmenu-group>
</template>

<script setup>
import {
  BIconArrowBarRight,
  BIconBookmarkCheck,
  BIconBookmarkX,
  BIconCalendar,
  BIconCalendarX,
  BIconCart,
  BIconCartX,
  BIconChat,
  BIconCheck,
  BIconLock,
  BIconTrash,
  BIconX,
} from "bootstrap-icons-vue";
import { BAlert, BNavItem, BTab, BTabs } from "bootstrap-vue-3";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import { condition } from "~/composables/condition";
import { collection, collection as collectionStore } from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";

const { copies, selectedIssuesById, publicationcode } = defineProps({
  selectedIssuesById: {
    type: Object,
    required: true,
  },
  copies: {
    type: Array,
    required: true,
  },
  publicationcode: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["clear-selection"]);
const { conditions } = condition();

const defaultState = $ref({
  condition: "possessed",
  isToSell: "do_not_change",
  purchaseId: "do_not_change",
  isToRead: "do_not_change",
});
const today = new Date().toISOString().slice(0, 10);
const { t: $t } = useI18n();
let editingCopies = $ref([]);
let currentCopyIndex = $ref(0);
const purchases = $computed(() => collection().purchases);
const conditionStates = $computed(() => ({
  ...(isSingleIssueSelected
    ? {}
    : {
        do_not_change: $t("Conserver l'état actuel"),
      }),
  missing: $t("Marquer comme non-possédé(s)"),
  possessed: $t("Marquer comme possédé(s)"),
  bad: $t("Marquer comme en mauvais état"),
  notsogood: $t("Marquer comme en état moyen"),
  good: $t("Marquer comme en bon état"),
}));
const purchaseStates = $computed(() => ({
  ...(isSingleIssueSelected
    ? {}
    : {
        do_not_change: $t("Conserver la date d'achat"),
      }),
  link: $t("Associer avec une date d'achat"),
  unlink: $t("Ne pas associer avec une date d'achat"),
}));
const toReadStates = $computed(() => ({
  ...(isSingleIssueSelected
    ? {}
    : {
        do_not_change: $t("Conserver la pile de lecture"),
      }),
  true: $t("Inclus dans la pile de lecture"),
  false: $t("Exclus de la pile de lecture"),
}));
const marketplaceStates = $computed(() => ({
  ...(isSingleIssueSelected
    ? {}
    : {
        do_not_change: { text: $t("Ne rien changer") },
      }),
  false: { text: $t("Ne pas marquer comme à vendre") },
  true: { text: $t("Marquer comme à vendre") },
  contact: {
    text: $t("Contacter"),
    isSaleDisabled,
    tooltip: isSaleDisabled
      ? $t(
          "Aucun utilisateur n'a envoyé de demande pour acheter ces numéros pour le moment"
        )
      : $t(
          "Contactez un utilisateur pour négocier la vente ou l'échange des numéros qui l'intéressent"
        ),
  },
  setAside: {
    text: $t("Réserver pour"),
    isSaleDisabled,
    tooltip: isSaleDisabled
      ? $t(
          "Aucun utilisateur n'a envoyé de demande pour acheter ces numéros pour le moment"
        )
      : $t(
          "Réservez des numéros à un utilisateur dans le but de les lui envoyer plus tard. Les autres utilisateurs ne pourront plus vous envoyer de demandes d'achat pour ces numéros."
        ),
  },
  transfer: {
    text: $t("Transférer à"),
    isSaleDisabled,
    tooltip: isSaleDisabled
      ? $t(
          "Aucun utilisateur n'a envoyé de demande pour acheter ces numéros pour le moment"
        )
      : $t(
          "Transférez des numéros à un utilisateur avec qui vous avez négocié une vente ou un échange"
        ),
  },
}));

const isSaleDisabled = $computed(
  () => !userIdsWhoSentRequestsForAllSelected.length
);

let isSingleIssueSelected = $computed(
  () => Object.keys(selectedIssuesById).length === 1
);
const hasNoCopies = $computed(() => !editingCopies.length);
const hasMaxCopies = $computed(() => editingCopies.length >= 3);
const formatDate = (value) => (/\d{4}-\d{2}-\d{2}/.test(value) ? value : today);
const updateEditingCopies = () => {
  if (isSingleIssueSelected) {
    if (copies.length) editingCopies = JSON.parse(JSON.stringify(copies));
    else editingCopies = [{ ...defaultState, condition: "missing" }];
  } else {
    editingCopies = [{ ...defaultState }];
  }
};

const userIdsWhoSentRequestsForAllSelected = $computed(() =>
  Object.keys(selectedIssuesById).reduce(
    (acc, issueId, idx) =>
      idx === 0
        ? [
            ...new Set(
              receivedRequests
                .filter(
                  ({ issueId: receivedRequestIssueId }) =>
                    receivedRequestIssueId === parseInt(issueId)
                )
                .map(({ buyerId }) => buyerId)
            ),
          ]
        : acc.filter((buyerId) =>
            receivedRequests.filter(
              ({
                issueId: receivedRequestIssueId,
                buyerId: receivedRequestBuyerId,
              }) =>
                receivedRequestIssueId === parseInt(issueId) &&
                receivedRequestBuyerId === buyerId
            )
          ),
    []
  )
);

const buyerUserNamesById = $computed(() => marketplace().buyerUserNamesById);

const receivedRequests = $computed(() =>
  marketplace().issueRequestsAsSeller?.filter(
    ({ issueId }) => issueId === copies[0].id
  )
);

const convertConditionToDbValue = (condition) =>
  (conditions.find(({ value }) => value === condition) || { dbValue: null })
    .dbValue;
const updateSelectedIssues = async () => {
  let issueDetails = {
    condition: editingCopies.map(({ condition }) =>
      convertConditionToDbValue(condition)
    ),
    istoread: editingCopies.map(({ isToRead }) => isToRead),
    istosell: editingCopies.map(({ isToSell }) => isToSell),
    purchaseId: editingCopies.map(({ purchaseId }) => purchaseId),
  };
  if (!isSingleIssueSelected) {
    issueDetails = Object.keys(issueDetails).reduce(
      (acc, detailKey) => ({
        ...acc,
        [detailKey]: issueDetails[detailKey][0],
      }),
      {}
    );
  }

  await updateIssues({
    issueNumbers: Object.values(selectedIssuesById),
    ...issueDetails,
  });
};

const updateIssues = async (data) => {
  await collectionStore().updateCollection({ ...data, publicationcode });
  emit("clear-selection");
};
const createPurchase = async (data) => {
  await collectionStore().createPurchase(data.date, data.description);
};
const deletePurchase = async (data) => {
  await collectionStore().deletePurchase(data.id);
};

watch(
  () => selectedIssuesById,
  () => updateEditingCopies(),
  { immediate: true }
);
watch(
  () => copies,
  () => updateEditingCopies(),
  { immediate: true }
);

watch(
  () => editingCopies.length,
  (newValue) => {
    currentCopyIndex = newValue - 1;
  }
);
</script>

<style lang="scss">
@import "~/styles/context-menu.scss";
</style>
