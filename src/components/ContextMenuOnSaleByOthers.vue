<template>
  <li class="header">
    {{
      $t(
        "{count} numéro sélectionné|{count} numéros sélectionnés",
        Object.keys(selectedIssuesById).length
      )
    }}
  </li>
  <BAlert
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
  </BAlert>
  <BAlert
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
  </BAlert>
  <BAlert
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
  </BAlert>
  <v-contextmenu-submenu
    v-else-if="contactMethods[selectedIssuesBuyerIds[0]]"
    style="padding: 0 1rem !important"
    @mouseleave.prevent="() => {}"
  >
    <template #title>
      {{ $t("Je suis intéressé(e) par ces numéros") }}
    </template>
    <v-contextmenu-group
      :title="`Contacter ${stats[selectedIssuesBuyerIds[0]].username}`"
    >
      <v-contextmenu-item
        v-for="(value, contactMethod) in contactMethods[
          selectedIssuesBuyerIds[0]
        ]"
        :key="`contact-method-${contactMethod}`"
        :hide-on-click="false"
        class="clickable"
        @click.prevent="requestIssues({ issueIds })"
        ><template v-if="contactMethod === 'email'">{{
          $t("Par email")
        }}</template
        ><template v-if="contactMethod === 'discordId'">{{
          $t("Via Discord")
        }}</template></v-contextmenu-item
      >
    </v-contextmenu-group>
  </v-contextmenu-submenu>
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
const emit = defineEmits(["clear-selection"]);

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

const requestIssues = async (data) => {
  await marketplace().requestIssues(data.issueIds);
  await marketplace().loadIssueRequestsAsBuyer(true);
  emit("clear-selection");
};

onMounted(async () => {
  await marketplace().loadContactMethods(selectedIssuesBuyerIds[0]);
});
</script>

<style lang="scss">
@import "~/styles/context-menu.scss";
</style>
