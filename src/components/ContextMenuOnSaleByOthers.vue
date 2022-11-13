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
      v-if="!Object.keys(selectedIssuesById).length"
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
    <li
      v-else
      class="footer clickable two-lines pre-wrap"
      @click="requestIssues({ issueIds })"
      v-html="$t('Je suis intéressé par ces numéros,\ncontacter les vendeurs')"
    />
  </v-contextmenu-group>
</template>

<script setup>
import { BAlert } from "bootstrap-vue-3";
import { useI18n } from "vue-i18n";

import { marketplace } from "~/stores/marketplace";

const { selectedIssuesById } = defineProps({
  selectedIssuesById: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["clear-selection"]);

const issueIds = $computed(() =>
  Object.values(selectedIssuesById).map(
    (issueNumberAndUser) => issueNumberAndUser.split("-id-")[1]
  )
);

const issuesWithMultipleCopiesSelected = $computed(() =>
  Object.entries(
    Object.values(selectedIssuesById).reduce((acc, issueNumberAndUser) => {
      const issueNumber = issueNumberAndUser.split("-id-")[0];
      return {
        ...acc,
        [issueNumber]: (acc[issueNumber] || 0) + 1,
      };
    }, {})
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
  emit("clear-selection");
};
</script>

<style lang="scss">
@import "~/styles/context-menu.scss";
</style>
