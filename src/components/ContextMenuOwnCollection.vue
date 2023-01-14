<template>
  <li class="header">
    {{
      $t(
        "{count} numéro sélectionné|{count} numéros sélectionnés",
        selectedIssues.length
      )
    }}
  </li>
  <b-alert
    v-if="!editingCopies.length"
    class="text-center m-0"
    show
    variant="danger"
  >
    {{
      $t("Vous allez retirer tous les exemplaires\ndes numéros sélectionnés")
    }}
  </b-alert>
  <b-alert
    v-if="hasMultipleCopiesAndMultipleIssues"
    class="text-center m-0"
    show
    variant="warning"
  >
    {{
      $t(
        "Vous possédez certains numéros sélectionnés\nen plusieurs exemplaires.\nSeul le premier exemplaire sera modifié."
      )
    }}
  </b-alert>
  <b-alert
    v-if="!selectedIssues.length"
    class="text-center m-0"
    show
    variant="warning"
  >
    {{
      $t(
        "Sélectionnez un ou plusieurs numéros dans la liste\npour les ajouter, modifier ou supprimer de votre collection."
      )
    }}
  </b-alert>
  <template v-else>
    <b-tabs
      v-model.number="currentCopyIndex"
      nav-class="copies-tabs"
      @changed="
        (newTabs: any) => {
          currentCopyIndex = newTabs.length - 1;
        }
      "
    >
      <b-tab
        v-for="(copy, copyIndex) in editingCopies"
        :key="`copy-${copyIndex}`"
      >
        <template #title>
          {{ $t("Exemplaire") }} {{ copyIndex + 1 }}
          <b-icon-trash
            @click.stop.prevent="editingCopies.splice(copyIndex, 1)"
          />
        </template>
        <v-contextmenu-group :title="$t('Etat')">
          <v-contextmenu-item
            v-for="{ labelContextMenu, value } in conditionStates"
            :key="`condition-${value}`"
            :hide-on-click="false"
            class="clickable"
            :class="{ selected: copy.condition === (value || 'missing') }"
            @click="copy.condition = value?.toString() || 'missing'"
          >
            <template v-if="value === 'do_not_change'" />
            <Condition v-else :value="value" />&nbsp;{{ labelContextMenu }}
          </v-contextmenu-item>
          <v-contextmenu-divider v-show="copy.condition !== 'missing'" />
        </v-contextmenu-group>
        <v-contextmenu-group
          v-show="copy.condition !== 'missing'"
          :title="$t('Pile de lecture')"
        >
          <v-contextmenu-item
            v-for="(stateText, stateId) in toReadStates"
            :key="`copy-${copyIndex}-to-read-state-${String(stateId)}`"
            :hide-on-click="false"
            class="clickable read-state"
            :class="{
              selected: String(copy.isToRead) === stateId,
              [stateId]: true,
            }"
            @click="
              copy.isToRead =
                stateId === 'do_not_change'
                  ? 'do_not_change'
                  : stateId === 'true'
            "
          >
            <b-icon-bookmark-check v-if="stateId === 'true'" />
            <b-icon-bookmark-x v-if="stateId === 'false'" />
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
              <template
                v-if="isSingleIssueSelected && stateId === 'do_not_change'"
              />
              <v-contextmenu-item
                v-else-if="stateId !== 'link'"
                :hide-on-click="false"
                class="clickable purchase-state"
                :class="{
                  selected: copy.purchaseId === stateId,
                  'v-context__sub': String(stateId) === 'link',
                  [stateId]: true,
                }"
                @click="copy.purchaseId = stateId === 'unlink' ? -1 : (stateId as 'do_not_change'|number|null)"
              >
                <b-icon-calendar-x v-if="stateId === 'unlink'" />
                {{ stateText }}
              </v-contextmenu-item>
              <v-contextmenu-submenu
                v-else
                :title="$t(`Date d'achat`)"
                @mouseleave.prevent="() => {}"
              >
                <template #title>
                  <b-icon-calendar v-if="stateId === 'link'" />
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
                          date: copy.newPurchaseDate!,
                          description: copy.newPurchaseDescription!,
                        });
                        copy.newPurchaseDescription = '';
                        copy.newPurchaseDate = today;
                        copy.newPurchaseContext = false;
                      "
                    >
                      <b-icon-check icon="check" />
                    </b-button>
                    <b-button
                      variant="warning"
                      class="btn-sm"
                      @click.stop="copy.newPurchaseContext = false"
                    >
                      <b-icon-x icon="x" />
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
                      @click="deletePurchase(purchaseId)"
                    >
                      <b-icon-trash />
                    </b-button>
                  </v-contextmenu-item>
                </v-contextmenu-group>
              </v-contextmenu-submenu>
            </template>
          </v-contextmenu-group>
          <v-contextmenu-group :title="$t('Marketplace')">
            <template
              v-for="[
                stateId,
                { text: stateText, tooltip, disabled },
              ] in Object.entries(marketplaceStates)"
              :key="`copy-${copyIndex}-marketplace-state-${stateId}`"
            >
              <v-contextmenu-item
                v-if="
                  ['true', 'false', 'do_not_change'].includes(
                    String(stateId)
                  ) || disabled
                "
                :hide-on-click="false"
                class="marketplace-state"
                :class="{
                  clickable: !disabled,
                  disabled,
                  selected: String(copy.isOnSale) === stateId,
                  [stateId]: true,
                }"
                @click="
                  copy.isOnSale = disabled
                    ? copy.isOnSale
                    : stateId === 'do_not_change'
                    ? 'do_not_change'
                    : stateId === 'true'
                "
              >
                <b-icon-cart v-if="stateId === 'true'" />
                <b-icon-cart-x v-if="stateId === 'false'" />
                <b-icon-lock v-if="stateId === 'setAside'" />
                <b-icon-arrow-bar-right v-if="stateId === 'transfer'" />

                <span :title="tooltip">{{ stateText }}</span>
              </v-contextmenu-item>
              <v-contextmenu-submenu
                v-else
                :title="stateText"
                class="cursor-help"
                :class="{
                  clickable: true,
                  selected:
                    String(copy.isOnSale).indexOf(String(stateId)) === 0,
                }"
                @mouseleave.prevent="() => {}"
              >
                <template #title>
                  <b-icon-lock v-if="stateId === 'setAside'" />
                  <b-icon-arrow-bar-right v-if="stateId === 'transfer'" />
                  <div :title="tooltip">{{ stateText }}</div>
                </template>
                <v-contextmenu-group :title="stateText">
                  <v-contextmenu-item
                    v-for="userId in userIdsWhoSentRequestsForAllSelected"
                    :key="`copy-${copyIndex}-user-id-${userId}`"
                    :hide-on-click="false"
                    class="clickable"
                    :class="{
                      selected:
                        copy.isOnSale === `${String(stateId)}-${userId}`,
                    }"
                    @click.prevent="
                      copy.isOnSale = `${String(stateId)}-${userId}`
                    "
                    >{{ buyerUserNamesById?.[userId] }}</v-contextmenu-item
                  >
                </v-contextmenu-group>
              </v-contextmenu-submenu></template
            >
          </v-contextmenu-group></template
        >
      </b-tab>
      <template v-if="!hasMaxCopies" #tabs-end>
        <b-nav-item
          v-if="isSingleIssueSelected || hasNoCopies"
          class="p-0"
          role="presentation"
          @click.prevent="editingCopies.push({ ...defaultCopyState })"
        >
          {{ $t("Ajouter un exemplaire") }}
        </b-nav-item>
        <b-nav-item
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
        </b-nav-item>
      </template>
    </b-tabs>
    <li class="footer clickable" @click="updateSelectedIssues(false)">
      {{ $t("Enregistrer les changements") }}
    </li>
  </template>
</template>

<script setup lang="ts">
import {
  BIconArrowBarRight,
  BIconBookmarkCheck,
  BIconBookmarkX,
  BIconCalendar,
  BIconCalendarX,
  BIconCart,
  BIconCartX,
  BIconCheck,
  BIconLock,
  BIconTrash,
  BIconX,
} from "bootstrap-icons-vue";
import { BAlert, BNavItem, BTab, BTabs } from "bootstrap-vue-3";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import condition from "~/composables/condition";
import {
  collection,
  collection as collectionStore,
  IssueWithPublicationcode,
} from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";
import { issue_condition } from "~prisma_clients/client_dm";
import { CopyState, CopyStateMultiple } from "~types/CollectionUpdate";

const { publicationcode, selectedIssueIdsByIssuenumber } = defineProps<{
  selectedIssueIdsByIssuenumber: {
    [issuenumber: string]: IssueWithPublicationcode[];
  };
  publicationcode: string;
}>();
const emit = defineEmits<{
  (e: "clear-selection"): void;
}>();
const { conditions } = condition();

const defaultCopyState: CopyState = {
  condition: "indefini",
  purchaseId: "do_not_change",
  isOnSale: "do_not_change",
  isToRead: "do_not_change",
};

const today = new Date().toISOString().slice(0, 10);
const { t: $t } = useI18n();
interface NewPurchase {
  newPurchaseDescription?: string;
  newPurchaseDate?: string;
  newPurchaseContext?: boolean;
}
let editingCopies = $ref([] as (CopyState & NewPurchase)[]);
let currentCopyIndex = $ref(0 as number);

const selectedIssues = $computed(() =>
  Object.keys(selectedIssueIdsByIssuenumber)
);
const purchases = $computed(() => collection().purchases);

const conditionStates = $computed(
  (): {
    value: issue_condition | "do_not_change" | null;
    labelContextMenu: string;
  }[] => [
    {
      value: "do_not_change",
      labelContextMenu: $t("Conserver l'état actuel"),
    },
    ...conditions,
  ]
);
const purchaseStates = $computed(() => ({
  do_not_change: $t("Conserver la date d'achat"),
  link: $t("Associer avec une date d'achat"),
  unlink: $t("Ne pas associer avec une date d'achat"),
}));
const toReadStates = $computed(() => ({
  do_not_change: $t("Conserver la pile de lecture"),
  true: $t("Inclus dans la pile de lecture"),
  false: $t("Exclus de la pile de lecture"),
}));
const marketplaceStates = $computed(
  () =>
    ({
      do_not_change: { text: $t("Ne rien changer"), disabled: false },
      false: { text: $t("Ne pas marquer comme à vendre"), disabled: false },
      true: { text: $t("Marquer comme à vendre"), disabled: false },
      setAside: {
        text: $t("Réserver pour"),
        disabled: isSaleDisabledGlobally,
        tooltip: isSaleDisabledGlobally
          ? $t(
              "Aucun utilisateur n'a envoyé de demande pour acheter ce numéro pour le moment | Aucun utilisateur n'a envoyé de demande pour acheter ces numéros pour le moment"
            )
          : $t(
              "Réservez ce numéro à un utilisateur dans le but de les lui envoyer plus tard. Les autres utilisateurs ne pourront plus vous envoyer de demandes d'achat pour ce numéros. | Réservez ces numéros à un utilisateur dans le but de les lui envoyer plus tard. Les autres utilisateurs ne pourront plus vous envoyer de demandes d'achat pour ces numéros."
            ),
      },
      transfer: {
        text: $t("Transférer à"),
        disabled: isSaleDisabledGlobally,
        tooltip: isSaleDisabledGlobally
          ? $t(
              "Aucun utilisateur n'a envoyé de demande pour acheter ce numéro pour le moment | Aucun utilisateur n'a envoyé de demande pour acheter ces numéros pour le moment"
            )
          : $t(
              "Transférez ce numéro à un utilisateur avec qui vous avez négocié une vente ou un échange | Transférez ces numéros à un utilisateur avec qui vous avez négocié une vente ou un échange"
            ),
      },
    } as {
      do_not_change: { text: string; tooltip: undefined; disabled: false };
      false: { text: string; tooltip: undefined; disabled: false };
      true: { text: string; tooltip: undefined; disabled: false };
      setAside: {
        text: string;
        tooltip: string;
        disabled: boolean;
      };
      transfer: {
        text: string;
        tooltip: string;
        disabled: boolean;
      };
    })
);

const isSaleDisabledGlobally = $computed(
  () => !userIdsWhoSentRequestsForAllSelected.length
);

let isSingleIssueSelected = $computed(() => selectedIssues.length === 1);
const hasNoCopies = $computed(() => !editingCopies.length);
const hasMaxCopies = $computed(() => editingCopies.length >= 3);
const hasMultipleCopiesAndMultipleIssues = $computed(
  () =>
    Object.values(selectedIssueIdsByIssuenumber).length > 1 &&
    Object.values(selectedIssueIdsByIssuenumber).some(
      (issues) => issues.length > 1
    )
);
const formatDate = (value: string) =>
  /\d{4}-\d{2}-\d{2}/.test(value) ? value : today;
const updateEditingCopies = () => {
  if (isSingleIssueSelected) {
    if (issueIds.length) {
      editingCopies = JSON.parse(
        JSON.stringify(
          Object.values(selectedIssueIdsByIssuenumber).reduce((acc, issues) => [
            ...acc,
            ...issues,
          ])
        )
      );
    } else {
      editingCopies = [{ ...defaultCopyState, condition: "missing" }];
    }
  } else {
    editingCopies = [{ ...defaultCopyState }];
  }
};

const issueIdsByIssuenumber = $computed(() =>
  Object.entries(selectedIssueIdsByIssuenumber).reduce(
    (acc, [issuenumber, issues]) => ({
      ...acc,
      [issuenumber]: issues.map(({ id }) => id),
    }),
    {} as { [issuenumber: string]: number[] }
  )
);

const issueIds = $computed(() =>
  Object.values(selectedIssueIdsByIssuenumber).reduce(
    (acc, issues) => [...acc, ...issues.map(({ id }) => id)],
    [] as number[]
  )
);

const userIdsWhoSentRequestsForAllSelected = $computed(() =>
  issueIds.reduce(
    (acc, issueId, idx) =>
      idx === 0
        ? [
            ...new Set(
              (receivedRequests || [])
                .filter(
                  ({ issueId: receivedRequestIssueId }) =>
                    receivedRequestIssueId === issueId
                )
                .map(({ buyerId }) => buyerId)
            ),
          ]
        : acc.filter((buyerId) =>
            (receivedRequests || []).filter(
              ({
                issueId: receivedRequestIssueId,
                buyerId: receivedRequestBuyerId,
              }) =>
                receivedRequestIssueId === issueId &&
                receivedRequestBuyerId === buyerId
            )
          ),
    [] as number[]
  )
);

const buyerUserNamesById = $computed(() => marketplace().buyerUserNamesById);

const receivedRequests = $computed(() =>
  marketplace().issueRequestsAsSeller?.filter(({ issueId }) =>
    issueIds.includes(issueId)
  )
);

const updateSelectedIssues = async (force = false) => {
  if (!force && String(editingCopies[0].isOnSale).indexOf("transfer-") === 0) {
    const transferToUser = (editingCopies[0].isOnSale as string).split(
      "transfer-"
    )[1];
    const isConfirmed = confirm(
      $t(
        "Les numéros sélectionnés vont être transférés à {0} et n'apparaitront plus dans votre collection.",
        [buyerUserNamesById?.[parseInt(transferToUser)]]
      )
    );
    if (!isConfirmed) {
      return;
    }
  }
  let issueDetailsMultiple: CopyStateMultiple = {
    condition: editingCopies.map(({ condition }) => condition),
    isToRead: editingCopies.map(({ isToRead }) => isToRead),
    isOnSale: editingCopies.map(({ isOnSale }) => isOnSale),
    purchaseId: editingCopies.map(({ purchaseId }) => purchaseId),
  };
  let issueDetails: CopyState | null = null;
  if (!isSingleIssueSelected) {
    issueDetails = {
      condition: issueDetailsMultiple.condition[0],
      isToRead: issueDetailsMultiple.isToRead[0],
      isOnSale: issueDetailsMultiple.isOnSale[0],
      purchaseId: issueDetailsMultiple.purchaseId[0],
    } as CopyState;
  }

  await updateIssues({
    issueDetails: issueDetails || issueDetailsMultiple,
  });
};

const updateIssues = async ({
  issueDetails,
}: {
  issueDetails: CopyState | CopyStateMultiple;
}) => {
  await collectionStore().updateCollection({
    publicationcode,
    issueIdsByIssuenumber,
    condition: issueDetails.condition,
    isToRead: issueDetails.isToRead,
    isOnSale: issueDetails.isOnSale,
    purchaseId: issueDetails.purchaseId,
  });

  await marketplace().loadIssuesOnSaleByOthers(true);
  await marketplace().loadIssueRequestsAsSeller(true);
  emit("clear-selection");
};
const createPurchase = async (data: { date: string; description: string }) => {
  await collectionStore().createPurchase(data.date, data.description);
};
const deletePurchase = async (id: number) => {
  await collectionStore().deletePurchase(id);
};

watch(
  () => selectedIssueIdsByIssuenumber,
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
