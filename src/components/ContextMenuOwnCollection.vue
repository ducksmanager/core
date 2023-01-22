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
    v-if="editingCopies && !editingCopies.copies.length"
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
    v-if="editingIssues && !selectedIssues.length"
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
      <template v-if="editingCopies">
        <b-tab
          v-for="(copy, copyIndex) in editingCopies.copies"
          :key="`copy-${copyIndex}`"
        >
          <template #title>
            {{ $t("Exemplaire") }} {{ copyIndex + 1 }}
            <i-bi-trash
              @click.stop.prevent="editingCopies!.copies.splice(copyIndex, 1)"
            /> </template
          ><IssueCopyEdit
            :copy="{ ...copy, copyIndex }"
            @update="
              editingCopies!.copies[copyIndex] = $event.newCopy
            " /></b-tab
      ></template>

      <b-tab v-else key="copy-0">
        <template #title> {{ $t("Exemplaire") }} 0</template>
        <IssueCopyEdit
          :copy="editingIssues"
          @update="editingIssues = $event.newCopy"
        />
      </b-tab>
      <template v-if="!hasMaxCopies" #tabs-end>
        <b-nav-item
          v-if="isSingleIssueSelected || hasNoCopies"
          class="p-0"
          role="presentation"
          @click.prevent="
            editingCopies!.copies.push({
              id: null,
              country: publicationcode.split('/')[0],
              magazine: publicationcode.split('/')[1],
              publicationcode,
              issuenumber: editingCopies!.issuenumber,
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
    <li class="footer clickable" @click="updateSelectedIssues()">
      {{ $t("Enregistrer les changements") }}
    </li>
  </template>
</template>

<script setup lang="ts">
import { BAlert, BNavItem, BTab, BTabs } from "bootstrap-vue-next";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import {
  collection as collectionStore,
  IssueWithPublicationcodeOptionalId,
} from "~/stores/collection";
import { marketplace } from "~/stores/marketplace";
import { SaleState } from "~types/CollectionUpdate";

const user = $computed(() => collectionStore().user);
let { publicationcode, selectedIssueIdsByIssuenumber } = defineProps<{
  selectedIssueIdsByIssuenumber: {
    [issuenumber: string]: IssueWithPublicationcodeOptionalId[];
  };
  publicationcode: string;
}>();
const emit = defineEmits<{
  (e: "clear-selection"): void;
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

let editingCopies = $computed(() => {
  if (!isSingleIssueSelected) {
    return null;
  } else {
    return {
      publicationcode,
      issuenumber: selectedIssues[0],
      copies: selectedIssueIdsByIssuenumber[selectedIssues[0]],
    };
  }
});

let editingIssues = $computed(() => {
  if (isSingleIssueSelected) {
    return null;
  } else {
    return {
      publicationcode,
      issuenumbers: selectedIssues,
      ...defaultIssueState,
    };
  }
});

let currentCopyIndex = $ref(0 as number);

const selectedIssues = $computed(() =>
  Object.keys(selectedIssueIdsByIssuenumber)
);

let isSingleIssueSelected = $computed(() => selectedIssues.length === 1);
const hasNoCopies = $computed(
  () =>
    (editingCopies && editingCopies.issuenumber === null) ||
    (editingIssues && !editingIssues.issuenumbers.length)
);
const hasMaxCopies = $computed(
  () => editingCopies && editingCopies.copies.length >= 3
);
const hasMultipleCopiesAndMultipleIssues = $computed(
  () =>
    Object.values(selectedIssueIdsByIssuenumber).length > 1 &&
    Object.values(selectedIssueIdsByIssuenumber).some(
      (issues) => issues.length > 1
    )
);
const updateSelectedIssues = async () => {
  const isIssueTransfer = (isOnSale: SaleState | undefined) =>
    typeof isOnSale === "object" && "transferTo" in isOnSale;

  const hasIssuesToTransfer = editingIssues
    ? isIssueTransfer(editingIssues.isOnSale)
    : editingCopies!.copies.some(({ isOnSale }) => isIssueTransfer(isOnSale));
  if (hasIssuesToTransfer) {
    const isConfirmed = confirm(
      $t(
        "Les numéros sélectionnés vont être transférés à un ou plusieurs autres utilisateurs et n'apparaitront plus dans votre collection."
      )
    );
    if (!isConfirmed) {
      return;
    }
  }

  await updateIssues();
};

const updateIssues = async () => {
  if (editingIssues) {
    await collectionStore().updateCollectionMultipleIssues(editingIssues);
  } else if (editingCopies) {
    await collectionStore().updateCollectionSingleIssue(editingCopies);
  }
  await marketplace().loadIssuesOnSaleByOthers(true);
  await marketplace().loadIssueRequestsAsSeller(true);
  emit("clear-selection");
};

watch(
  () => editingCopies && editingCopies.copies.length,
  (newValue) => {
    if (newValue !== null) {
      currentCopyIndex = newValue - 1;
    }
  }
);
</script>

<style lang="scss">
@import "~/styles/context-menu.scss";
</style>
