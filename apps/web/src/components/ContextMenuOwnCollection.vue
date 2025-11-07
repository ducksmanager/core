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
    v-if="
      initialCopies?.copies?.some((copy) => copy.condition) &&
      editedCopies?.copies?.every((copy) => !copy.condition)
    "
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
      v-model:index="currentCopyIndex"
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
              @click.stop.prevent="editedCopies!.copies[copyIndex] = {...editedCopies!.copies[copyIndex], condition: null}"
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
              publicationcode,
              issuecode: initialCopies!.issuecode,
              isSubscription: false,
              userId: user!.id,
              creationDate: new Date(),
              ...defaultCopyState,
            } as IssueWithPublicationcodeOptionalId);
            nextTick(() => {
              currentCopyIndex = initialCopies!.copies.length - 1;
            });
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
    <li
      v-if="editedCopies?.copies.length || editedIssues?.issuecodes.length"
      class="footer clickable px-3"
      @click="updateIssues()"
    >
      {{ $t("Enregistrer les changements") }}
    </li>
  </template>
</template>

<script setup lang="ts">
import type { IssueWithPublicationcodeOptionalId } from "~/stores/collection";
import type {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~dm-types/CollectionUpdate";

const { loadIssuesOnSaleByOthers, loadIssueRequestsAsSeller } = marketplace();

const { updateCollectionMultipleIssues, updateCollectionSingleIssue } =
  collection();
const { user } = storeToRefs(collection());
let {
  publicationcode,
  selectedIssueIdsByIssuecode: selectedIssueIdsByIssuecode,
} = defineProps<{
  selectedIssueIdsByIssuecode: {
    [issuecode: string]: IssueWithPublicationcodeOptionalId[];
  };
  publicationcode: string;
}>();
const emit = defineEmits<{
  (e: "clear-selection"): void;
}>();
const { t: $t } = useI18n();

const defaultCopyState = {
  condition: "indefini",
  purchaseId: null,
  labelIds: [],
};

const defaultIssueState = {
  condition: undefined,
  purchaseId: undefined,
  labelIds: undefined,
};

let initialIssues = $ref<CollectionUpdateMultipleIssues>();
let editedIssues = $ref<CollectionUpdateMultipleIssues>();

let initialCopies = $ref<CollectionUpdateSingleIssue>();
let editedCopies = $ref<CollectionUpdateSingleIssue>();

let currentCopyIndex = $ref(0);

const selectedIssues = $computed(() =>
  Object.keys(selectedIssueIdsByIssuecode),
);

let isSingleIssueSelected = $computed(() => selectedIssues.length === 1);
const hasNoCopies = $computed(
  () =>
    (initialCopies && initialCopies.issuecode === null) ||
    (initialIssues && !initialIssues.issuecodes.length),
);
const hasMaxCopies = $computed(
  () => initialCopies && initialCopies.copies.length >= 3,
);
const hasMultipleCopiesAndMultipleIssues = $computed(
  () =>
    Object.keys(selectedIssueIdsByIssuecode).length > 1 &&
    Object.values(selectedIssueIdsByIssuecode).some(
      (issues) => issues.length > 1,
    ),
);

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
    if (newValue !== undefined) {
      currentCopyIndex = newValue - 1;
    }
  },
);

watch(
  $$(selectedIssues),
  (newValue) => {
    if (isSingleIssueSelected) {
      editedIssues = initialIssues = undefined;
      editedCopies = initialCopies = {
        issuecode: newValue[0],
        copies: selectedIssueIdsByIssuecode[newValue[0]],
      };
    } else {
      editedCopies = initialCopies = undefined;
      editedIssues = initialIssues = {
        issuecodes: newValue,
        ...defaultIssueState,
      };
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
@use "../styles/context-menu.scss";
</style>
