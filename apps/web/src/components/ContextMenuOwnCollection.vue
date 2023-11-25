<template>
  <li class="header">
    {{
      $t(
        "{count} numéro sélectionné|{count} numéros sélectionnés",
        selectedIssues.length,
      )
    }}
  </li>
  <b-alert
    v-if="initialCopies && !initialCopies.copies.length"
    class="text-center m-0"
    :model-value="true"
    variant="danger"
  >
    {{
      $t("Vous allez retirer tous les exemplaires\ndes numéros sélectionnés")
    }}
  </b-alert>
  <b-alert
    v-if="hasMultipleCopiesAndMultipleIssues"
    class="text-center m-0"
    :model-value="true"
    variant="warning"
  >
    {{
      $t(
        "Vous possédez certains numéros sélectionnés\nen plusieurs exemplaires.\nSeul le premier exemplaire sera modifié.",
      )
    }}
  </b-alert>
  <b-alert
    v-if="initialIssues && !selectedIssues.length"
    class="text-center m-0"
    :model-value="true"
    variant="warning"
  >
    {{
      $t(
        "Sélectionnez un ou plusieurs numéros dans la liste\npour les ajouter, modifier ou supprimer de votre collection.",
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
      <template v-if="initialCopies">
        <b-tab
          v-for="(copy, copyIndex) in initialCopies.copies"
          :key="`copy-${copyIndex}`"
        >
          <template #title>
            {{ $t("Exemplaire") }} {{ copyIndex + 1 }}
            <i-bi-trash
              @click.stop.prevent="initialCopies!.copies.splice(copyIndex, 1)"
            /> </template
          ><IssueCopyEdit
            :copy="copy as IssueWithPublicationcodeOptionalId"
            :copy-index="copyIndex"
            @update="
              editedCopies!.copies[copyIndex] =
                $event as IssueWithPublicationcodeOptionalId
            " /></b-tab
      ></template>

      <b-tab v-else key="copy-0">
        <template #title> {{ $t("Exemplaire") }} 1</template>
        <IssueCopyEdit
          :copy="initialIssues!"
          @update="editedIssues = $event as CollectionUpdateMultipleIssues"
        />
      </b-tab>
      <template v-if="!hasMaxCopies" #tabs-end>
        <b-nav-item
          v-if="isSingleIssueSelected || hasNoCopies"
          class="p-0"
          role="presentation"
          @click.prevent="
            initialCopies!.copies.push({
              id: null,
              country: publicationcode.split('/')[0],
              magazine: publicationcode.split('/')[1],
              publicationcode,
              issuenumber: initialCopies!.issuenumber,
              isSubscription: false,
              userId: user!.id,
              creationDate: new Date(),
              ...defaultCopyState,
            } as IssueWithPublicationcodeOptionalId)
          "
        >
          {{ $t("Ajouter un exemplaire") }}
        </b-nav-item>
        <b-nav-item
          v-else
          disabled
          class="p-0 disabled text-secondary"
          role="presentation"
          :title="
            $t(
              `Vous pouvez seulement ajouter un exemplaire lorsqu'un seul numéro est sélectionné`,
            )
          "
        >
          {{ $t("Ajouter un exemplaire") }}
        </b-nav-item>
      </template>
    </b-tabs>
    <li class="footer clickable" @click="updateSelectedIssues()">
      {{ $t("Enregistrer les changements") }}
    </li>
  </template>
</template>

<script setup lang="ts">
import {
  collection,
  IssueWithPublicationcodeOptionalId,
} from "~/stores/collection";
import {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
  SaleState,
} from "~dm-types/CollectionUpdate";

const { loadIssuesOnSaleByOthers, loadIssueRequestsAsSeller } = marketplace();

const { updateCollectionMultipleIssues, updateCollectionSingleIssue } =
  collection();
const { user } = storeToRefs(collection());
let { publicationcode, selectedIssueIdsByIssuenumber } = defineProps<{
  selectedIssueIdsByIssuenumber: {
    [issuenumber: string]: IssueWithPublicationcodeOptionalId[];
  };
  publicationcode: string;
}>();
const emit = defineEmits<{
  (e: "clear-selection"): void;
  (
    e: "launch-modal",
    options: {
      contactMethod: string;
      sellerId: number;
    },
  ): void;
  (e: "close"): void;
}>();
const { t: $t } = useI18n();

const defaultCopyState = {
  condition: "indefini",
  isToRead: false,
  isOnSale: false,
  purchaseId: null,
};

const defaultIssueState = {
  condition: undefined,
  isToRead: undefined,
  isOnSale: undefined,
  purchaseId: undefined,
};

let initialIssues = $ref(null as CollectionUpdateMultipleIssues | null);
let editedIssues = $ref(null as CollectionUpdateMultipleIssues | null);

let initialCopies = $ref(null as CollectionUpdateSingleIssue | null);
let editedCopies = $ref(null as CollectionUpdateSingleIssue | null);

let currentCopyIndex = $ref(0 as number);

const selectedIssues = $computed(() =>
  Object.keys(selectedIssueIdsByIssuenumber),
);

let isSingleIssueSelected = $computed(() => selectedIssues.length === 1);
const hasNoCopies = $computed(
  () =>
    (initialCopies && initialCopies.issuenumber === null) ||
    (initialIssues && !initialIssues.issuenumbers.length),
);
const hasMaxCopies = $computed(
  () => initialCopies && initialCopies.copies.length >= 3,
);
const hasMultipleCopiesAndMultipleIssues = $computed(
  () =>
    Object.values(selectedIssueIdsByIssuenumber).length > 1 &&
    Object.values(selectedIssueIdsByIssuenumber).some(
      (issues) => issues.length > 1,
    ),
);
const updateSelectedIssues = async () => {
  const isIssueTransfer = (isOnSale: SaleState | undefined) =>
    typeof isOnSale === "object" && "transferTo" in isOnSale;

  const hasIssuesToTransfer = initialIssues
    ? isIssueTransfer(initialIssues.isOnSale)
    : initialCopies!.copies.some(({ isOnSale }) => isIssueTransfer(isOnSale));
  if (hasIssuesToTransfer) {
    const isConfirmed = confirm(
      $t(
        "Les numéros sélectionnés vont être transférés à un ou plusieurs autres utilisateurs et n'apparaitront plus dans votre collection.",
      ),
    );
    if (!isConfirmed) {
      return;
    }
  }

  await updateIssues();
};

const updateIssues = async () => {
  if (initialIssues) {
    await updateCollectionMultipleIssues(initialIssues);
  } else if (initialCopies) {
    await updateCollectionSingleIssue(initialCopies);
  }
  await loadIssuesOnSaleByOthers(true);
  await loadIssueRequestsAsSeller(true);
  emit("clear-selection");
};

watch(
  () => initialCopies && initialCopies.copies.length,
  (newValue) => {
    if (newValue !== null) {
      currentCopyIndex = newValue - 1;
    }
  },
);

watch(
  $$(selectedIssues),
  (newValue) => {
    if (isSingleIssueSelected) {
      editedIssues = initialIssues = null;
      editedCopies = initialCopies = {
        publicationcode,
        issuenumber: newValue[0],
        copies: selectedIssueIdsByIssuenumber[newValue[0]],
      };
    } else {
      editedCopies = initialCopies = null;
      editedIssues = initialIssues = {
        publicationcode,
        issuenumbers: newValue,
        ...defaultIssueState,
      };
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
@import "~/styles/context-menu.scss";
</style>
