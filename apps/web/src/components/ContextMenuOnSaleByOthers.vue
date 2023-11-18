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
    v-for="(count, issuenumber) in issuesWithMultipleCopiesSelected"
    :key="issuenumber"
    class="two-lines pre-wrap text-center m-0"
    :model-value="true"
    variant="warning"
  >
    {{
      $t(
        "Vous avez sélectionné {0} fois le numéro {1}.\nAssurez-vous de ne pas acheter plusieurs fois le même numéro !",
        [count, issuenumber],
      )
    }}
  </b-alert>
  <b-alert
    v-if="selectedIssuesBuyerIds.length === 0"
    class="text-center m-0"
    :model-value="true"
    variant="warning"
  >
    {{
      $t(
        "Sélectionnez un ou plusieurs numéros dans la liste\npour contacter leurs vendeurs.",
      )
    }}
  </b-alert>
  <b-alert
    v-else-if="selectedIssuesBuyerIds.length > 1"
    class="text-center m-0"
    :model-value="true"
    variant="warning"
  >
    {{
      $t(
        "Vous avez sélectionné des numéros en vente par des vendeurs différents. Sélectionnez des numéros en vente par un seul vendeur à la fois",
      )
    }}
  </b-alert>
  <template v-else-if="contactMethods[selectedIssuesBuyerIds[0]]">
    <v-contextmenu-submenu
      class="contact"
      :title="
        selectedIssues.length > 1
          ? $t('Je suis intéressé(e) par ces numéros')
          : $t('Je suis intéressé(e) par ce numéro')
      "
      @mouseleave.prevent="() => {}"
    >
      <v-contextmenu-group
        :title="`${$t('Contacter')} ${
          stats[selectedIssuesBuyerIds[0]].username
        }`"
      >
        <v-contextmenu-item
          v-for="contactMethod in Object.keys(
            contactMethods[selectedIssuesBuyerIds[0]],
          )"
          :key="`contact-method-${contactMethod}`"
          :hide-on-click="false"
          class="clickable"
          ><span
            v-if="contactMethod === 'email'"
            @click="
              emit('close');
              emit('launch-modal', {
                contactMethod: 'email',
                sellerId: selectedIssuesBuyerIds[0],
              });
            "
            >{{ $t("Par email") }}</span
          ><span
            v-if="contactMethod === 'discordId'"
            @click="
              emit('close');
              emit('launch-modal', {
                contactMethod: 'discordId',
                sellerId: selectedIssuesBuyerIds[0],
              });
            "
            >{{ $t("Sur Discord") }}</span
          ></v-contextmenu-item
        >
      </v-contextmenu-group>
    </v-contextmenu-submenu>
  </template>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";

const { selectedIssueIdsByIssuenumber } = defineProps<{
  selectedIssueIdsByIssuenumber: {
    [issuenumber: string]: IssueWithPublicationcode[];
  };
  publicationcode: string;
}>();
const emit = defineEmits<{
  (
    e: "launch-modal",
    options: {
      contactMethod: string;
      sellerId: number;
    },
  ): void;
  (e: "close"): void;
}>();

const selectedIssues = $computed(() =>
  Object.keys(selectedIssueIdsByIssuenumber),
);
const contactMethods = $computed(() => marketplace().contactMethods);
const issuesOnSaleById = $computed(() => marketplace().issuesOnSaleById);
const issueIds = $computed(() =>
  Object.values(selectedIssueIdsByIssuenumber).reduce(
    (acc, issues) => [...acc, ...issues.map(({ id }) => id!)],
    [] as number[],
  ),
);
const stats = $computed(() => users().stats);

const selectedIssuesBuyerIds = $computed(() => [
  ...new Set(
    issueIds.reduce(
      (acc, issueId) => [...acc, issuesOnSaleById[issueId].userId],
      [] as number[],
    ),
  ),
]);

const issuesWithMultipleCopiesSelected = $computed(() =>
  Object.entries(selectedIssueIdsByIssuenumber)
    .filter(([, copies]) => copies.length > 1)
    .reduce(
      (acc, [issuenumber, copies]) => ({
        ...acc,
        [issuenumber]: copies.length,
      }),
      {},
    ),
);

const { t: $t } = useI18n();

(async () => {
  if (selectedIssuesBuyerIds.length) {
    await marketplace().loadContactMethods(selectedIssuesBuyerIds[0]);
  }
})();
</script>

<style lang="scss">
@import "~/styles/context-menu.scss";
</style>
