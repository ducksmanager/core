<template>
  <v-contextmenu-group :title="$t('Etat')">
    <template
      v-for="{ value: stateId, getLabelContextMenu } in conditionStates"
      :key="`condition-${stateId}`"
    >
      <template v-if="isSingleIssueSelected && stateId === undefined" />
      <v-contextmenu-item
        v-else
        :hide-on-click="false"
        class="clickable"
        :class="{ selected: newCopyState.condition === stateId }"
        @click="newCopyState.condition = stateId"
      >
        <Condition :value="stateId || undefined" />&nbsp;{{
          getLabelContextMenu()
        }}</v-contextmenu-item
      >
    </template>
    <v-contextmenu-divider v-show="newCopyState.condition !== null" />
  </v-contextmenu-group>
  <template v-if="newCopyState.condition !== null">
    <v-contextmenu-group :title="$t('Date d\'achat')">
      <template
        v-for="{ label: stateText, value: stateId } in purchaseStates"
        :key="`copy-${copyIndex}-purchase-state-${stateId}`"
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
          @click="newCopyState.purchaseId = stateId === null ? -1 : stateId"
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
          <v-contextmenu-group>
            <v-contextmenu-item
              v-if="!newPurchase.context"
              :hide-on-click="false"
              class="clickable"
              @click.stop="
                newPurchase.context = { error: undefined };
                newPurchase.date = today;
              "
            >
              <b>{{ $t("Nouvelle date d'achat...") }}</b>
            </v-contextmenu-item>
            <template v-else>
              <b-alert v-if="newPurchase.context?.error" variant="danger" show>
                {{ newPurchase.context.error }}
              </b-alert>
              <v-contextmenu-item class="purchase-date" @click.stop="() => {}">
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
                  createPurchase(newPurchase.date!, newPurchase.description!)
                  .then(() => {
                    newPurchase = newPurchaseDefault;
                  })
                  .catch(({error}: {error: string}) => {
                    newPurchase.context = { error };
                  });
                "
                >
                  <i-bi-check />
                </b-button>
                <b-button
                  variant="warning"
                  class="btn-sm"
                  @click.stop="newPurchase = newPurchaseDefault"
                >
                  <i-bi-x />
                </b-button> </v-contextmenu-item
            ></template>
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
              <small class="date">{{ date.toISOString().split("T")[0] }}</small>
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
    <v-contextmenu-divider />
    <v-contextmenu-group
      v-if="!isSingleIssueSelected"
      :title="$t('Étiquettes')"
    >
      <b-alert variant="primary" show>
        {{
          $t(
            "Les étiquettes ne peuvent pas être changées lorsque plusieurs numéros sont sélectionnés.",
          )
        }}
      </b-alert>
    </v-contextmenu-group>
    <v-contextmenu-group v-else :title="$t('Étiquettes')">
      <label-pill-button
        v-for="label in labels?.filter(
          ({ userId, id }) => !userId || newCopyState.labelIds!.includes(id),
        )"
        :key="label.description"
        v-bind="label"
        :icon="
          label.description === ON_SALE_LABEL_DESCRIPTION
            ? IBiCart
            : IBiBookmarkCheck
        "
        :pressed="newCopyState.labelIds!.includes(label.id)"
        @update:pressed="toggleSetElement(newCopyState.labelIds!, label.id)"
      />
      <v-contextmenu-submenu
        :title="$t(`Mes étiquettes`)"
        @mouseleave.prevent="() => {}"
      >
        <template #title> <i-bi-tags />{{ $t(`Mes étiquettes`) }} </template>
        <v-contextmenu-group>
          <v-contextmenu-item
            v-if="!newLabel"
            :hide-on-click="false"
            class="clickable"
            @click.stop="newLabel = { context: { error: undefined } }"
          >
            <b>{{ $t("Nouvelle étiquette...") }}</b> </v-contextmenu-item
          ><template v-else>
            <b-alert v-if="newLabel.context?.error" variant="danger" show>
              {{ newLabel.context.error }}
            </b-alert>
            <v-contextmenu-item
              class="label-description"
              @click.stop="() => {}"
            >
              <input
                v-model="newLabel.description"
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
                  createLabel(newLabel.description!)
                    .then(() => {
                      newLabel = undefined;
                    })
                    .catch(({error}: {error: string}) => {
                      newLabel!.context = { error };
                    })
                "
              >
                <i-bi-check />
              </b-button>
              <b-button
                variant="warning"
                class="btn-sm"
                @click.stop="newLabel = undefined"
              >
                <i-bi-x />
              </b-button>
            </v-contextmenu-item>
          </template>
          <v-contextmenu-item
            v-for="{ id, description } in labels?.filter(
              ({ userId }) => !!userId,
            )"
            :key="`copy-label-${id}`"
            :hide-on-click="false"
            class="clickable label-description"
            :class="{
              selected: newCopyState.labelIds!.includes(id),
            }"
            @click.stop="toggleSetElement(newCopyState.labelIds!, id)"
          >
            <div class="mx-2">
              {{ description }}
            </div>
            <b-button
              class="delete-label btn-sm"
              :title="$t('Supprimer')"
              @click="deleteLabel(description); toggleSetElement(newCopyState.labelIds!, id)"
            >
              <i-bi-trash />
            </b-button>
          </v-contextmenu-item>
        </v-contextmenu-group>
      </v-contextmenu-submenu>
    </v-contextmenu-group>
    <v-contextmenu-divider />
    <v-contextmenu-group :title="$t('Marketplace')">
      <template
        v-for="{
          value: stateId,
          text: stateText,
          tooltip,
          disabled,
        } in marketplaceStates"
        :key="`copy-${copyIndex}-marketplace-state-${
          JSON.stringify(stateId) || stateId
        }`"
      >
        <v-contextmenu-item
          v-if="stateId === undefined || disabled"
          :hide-on-click="false"
          class="marketplace-state"
          :class="{
            clickable: !disabled,
            disabled,
            [`state-${stateId}`]: true,
          }"
        >
          <i-bi-lock v-if="'setAsideFor' in stateId" />
          <i-bi-arrow-bar-right v-if="'transferTo' in stateId" />

          <span :title="tooltip">{{ stateText }}</span>
        </v-contextmenu-item>
        <v-contextmenu-submenu
          v-else
          :title="stateText"
          class="cursor-help"
          :class="{
            clickable: true,
            selected: issueRequestsAsSeller?.some(
              ({ issueId }) =>
                'id' in newCopyState && issueId === newCopyState.id,
            ),
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
                  'transferTo' in stateId
                    ? false
                    : userIdsWhoSentRequestsForAllSelected?.includes(userId),
              }"
              @click.prevent="
                'transferTo' in stateId
                  ? transferIssuesToConfirm(userId)
                  : setIssuesAsideForConfirm(userId)
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
import IBiCalendar from "~icons/bi/calendar";
import type { IssueWithPublicationcodeOptionalId } from "~/stores/collection";
import type { CollectionUpdateMultipleIssues } from "~dm-types/CollectionUpdate";
import type { issue_condition } from "~prisma-schemas/schemas/dm/client/client";
import { BButton } from "bootstrap-vue-next";
import useSet from "~/composables/useSet";
import { ON_SALE_LABEL_DESCRIPTION } from "~dm-types/Labels";
import IBiCart from "~icons/bi/cart";
import IBiBookmarkCheck from "~icons/bi/bookmark-check";

const { toggleSetElement } = useSet();

const { conditions } = useCondition();

const { copy: copyState, copyIndex = null } = defineProps<{
  copy: IssueWithPublicationcodeOptionalId | CollectionUpdateMultipleIssues;
  copyIndex?: number | null;
}>();

let newCopyState = $ref(copyState);

const emit = defineEmits<{
  (
    e: "update",
    updatedCopy:
      | IssueWithPublicationcodeOptionalId
      | CollectionUpdateMultipleIssues,
  ): void;
}>();

const { issueRequestsAsSeller, buyerUserNamesById } =
  storeToRefs(marketplace());
const { transferIssuesTo, setIssuesAsideFor } = marketplace();

const { createPurchase, deletePurchase, createLabel, deleteLabel } =
  collection();
const { issues, purchases, labels } = storeToRefs(collection());
const { issuecodeDetails } = storeToRefs(coa());

const today = new Date().toISOString().slice(0, 10);

type NewPurchase = {
  description?: string;
  date?: string;
  context:
    | {
        error: string | undefined;
      }
    | undefined;
};

const newPurchaseDefault: NewPurchase = {
  description: "",
  date: today,
  context: { error: undefined },
};

let newPurchase = $ref(newPurchaseDefault);

type NewLabel = {
  description?: string;
  context:
    | {
        error: string | undefined;
      }
    | undefined;
};
let newLabel = $ref<NewLabel>();

const { t: $t } = useI18n();
const isSaleDisabledGlobally = $computed(
  () => !userIdsWhoSentRequestsForAllSelected.length,
);

const issuecodes = $computed(() =>
  isSingleIssueSelected
    ? [(copyState as IssueWithPublicationcodeOptionalId).issuecode]
    : (copyState as CollectionUpdateMultipleIssues).issuecodes,
);

const collectionForCurrentPublication = $computed(() =>
  issues.value?.filter(
    ({ publicationcode: issuePublicationcode }) =>
      issuecodeDetails.value[
        "issuecode" in copyState
          ? copyState.issuecode!
          : copyState.issuecodes[0]
      ].publicationcode === issuePublicationcode,
  ),
);

let isSingleIssueSelected = $computed(
  () =>
    copyState &&
    ("copyIndex" in copyState || ("id" in copyState && copyState.id === null)),
);

const conditionStates = $computed(
  (): {
    value: issue_condition | null | undefined;
    getLabelContextMenu: () => string;
  }[] => [
    {
      value: undefined,
      getLabelContextMenu: () => $t("Conserver l'état actuel"),
    },
    ...conditions.map(({ dbValue, getLabelContextMenu }) => ({
      value: dbValue,
      getLabelContextMenu,
    })),
  ],
);
const purchaseStates = $computed(() => [
  { value: undefined, label: $t("Conserver la date d'achat") },
  { value: 0, label: $t("Associer avec une date d'achat") },
  { value: null, label: $t("Ne pas associer avec une date d'achat") },
]);
const marketplaceStates = $computed(() => [
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

const receivedRequests = $computed(() =>
  issueRequestsAsSeller.value?.filter(({ issueId }) =>
    issueIds.includes(issueId),
  ),
);

const userIdsWhoSentRequestsForAllSelected = $computed(() =>
  (receivedRequests || [])
    .filter(({ issueId }) => issueIds.includes(issueId))
    .map(({ buyerId }) => buyerId),
);

const formatDate = (value: string) =>
  /\d{4}-\d{2}-\d{2}/.test(value) ? value : today;

const issueIds = $computed((): (number | null)[] =>
  issuecodes && collectionForCurrentPublication
    ? isSingleIssueSelected
      ? [
          collectionForCurrentPublication
            ?.filter(({ issuecode }) => issuecode === issuecodes[0])
            .find((_, currentCopyIndex) => copyIndex === currentCopyIndex)
            ?.id || null,
        ]
      : collectionForCurrentPublication
          ?.filter(({ issuecode }) => issuecodes.includes(issuecode))
          .map(({ id }) => id || null)
    : [],
);

const transferIssuesToConfirm = async (userId: number) => {
  if (
    confirm(
      $t(
        "Les numéros sélectionnés vont être transférés à un ou plusieurs autres utilisateurs et n'apparaitront plus dans votre collection. Confirmer ?",
      ),
    )
  ) {
    await transferIssuesTo(issueIds.filter(Boolean) as number[], userId);
  }
};

const setIssuesAsideForConfirm = async (userId: number) => {
  if (
    confirm($t("Voulez-vous vraiment réserver ces numéros à cet utilisateur ?"))
  ) {
    await setIssuesAsideFor(issueIds.filter(Boolean) as number[], userId);
  }
};

watch(
  () => copyState,
  (copyState) => {
    newCopyState = copyState;
  },
  { immediate: true },
);
watch(
  $$(newCopyState),
  (newCopyState) => {
    emit("update", newCopyState);
  },
  { deep: true },
);
</script>
