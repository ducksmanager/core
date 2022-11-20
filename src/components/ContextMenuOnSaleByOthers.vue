<template>
  <li class="header">
    {{
      $t(
        "{count} numéro sélectionné|{count} numéros sélectionnés",
        Object.keys(selectedIssuesById).length
      )
    }}
  </li>
  <b-alert
    v-for="(count, issueNumber) in issuesWithMultipleCopiesSelected"
    :key="issueNumber"
    class="two-lines pre-wrap text-center m-0"
    show
    variant="warning"
  >
    {{
      $t(
        "Vous avez sélectionné {0} fois le numéro {1}.\nAssurez-vous de ne pas acheter plusieurs fois le même numéro !",
        [count, issueNumber]
      )
    }}
  </b-alert>
  <b-alert
    v-if="selectedIssuesBuyerIds.length === 0"
    class="text-center m-0"
    show
    variant="warning"
  >
    {{
      $t(
        "Sélectionnez un ou plusieurs numéros dans la liste\npour contacter leurs vendeurs et les ajouter à votre collection."
      )
    }}
  </b-alert>
  <b-alert
    v-else-if="selectedIssuesBuyerIds.length > 1"
    class="text-center m-0"
    show
    variant="warning"
  >
    {{
      $t(
        "Vous avez sélectionner des numéros en vente par des auteurs différents. Sélectionnez des numéros en vente par un seul auteur."
      )
    }}
  </b-alert>
  <template v-else-if="contactMethods[selectedIssuesBuyerIds[0]]">
    <v-contextmenu-submenu
      class="contact"
      :title="$t('Je suis intéressé(e) par ces numéros')"
      @mouseleave.prevent="() => {}"
    >
      <v-contextmenu-group
        :title="`${$t('Contacter')} ${
          stats[selectedIssuesBuyerIds[0]].username
        }`"
      >
        <v-contextmenu-item
          v-for="contactMethod in Object.keys(
            contactMethods[selectedIssuesBuyerIds[0]]
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
                selectedIssueIds: Object.keys(selectedIssuesById),
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
                selectedIssueIds: Object.keys(selectedIssuesById),
              });
            "
            >{{ $t("Via Discord") }}</span
          ></v-contextmenu-item
        >
      </v-contextmenu-group>
    </v-contextmenu-submenu>
  </template>
</template>

<script setup>
import { BAlert } from "bootstrap-vue-3";
import { useI18n } from "vue-i18n";

import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";

const { selectedIssuesById } = defineProps({
  selectedIssuesById: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["clear-selection", "close"]);

const contactMethods = $computed(() => marketplace().contactMethods);
const issuesOnSaleById = $computed(() => marketplace().issuesOnSaleById);
const issueIds = $computed(() => Object.keys(selectedIssuesById).map(parseInt));
const stats = $computed(() => users().stats);

const selectedIssuesBuyerIds = $computed(() => [
  ...new Set(
    issueIds.reduce(
      (acc, issueId) => [...acc, issuesOnSaleById[issueId].userId],
      []
    )
  ),
]);

const issuesWithMultipleCopiesSelected = $computed(() =>
  Object.entries(
    Object.values(selectedIssuesById).reduce(
      (acc, issueNumber) => ({
        ...acc,
        [issueNumber]: (acc[issueNumber] || 0) + 1,
      }),
      {}
    )
  )
    .filter(([, count]) => count > 1)
    .reduce(
      (acc, [issueNumber, copies]) => ({ ...acc, [issueNumber]: copies }),
      {}
    )
);

const { t: $t } = useI18n();

onMounted(async () => {
  await marketplace().loadContactMethods(selectedIssuesBuyerIds[0]);
});
</script>

<style lang="scss">
@import "~/styles/context-menu.scss";
</style>
