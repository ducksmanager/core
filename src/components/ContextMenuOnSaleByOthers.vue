<template>
  <v-contextmenu-group>
    <li class="header">
      {{
        $t(
          "{count} numéro sélectionné|{count} numéros sélectionnés",
          selectedIssues.length
        )
      }}
    </li>
    <BAlert
      v-for="(count, issueNumber) in issuesWithMultipleCopiesSelected"
      :key="issueNumber"
      class="text-center m-0"
      show
      variant="warning"
    >
      {{
        $t(
          "Vous avez sélectionné {0} fois le numéro {1}. Assurez-vous de ne pas acheter plusieurs fois le même numéro !",
          [count, issueNumber]
        )
      }}
    </BAlert>
    <BAlert
      v-if="!selectedIssues.length"
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

const { selectedIssues } = defineProps({
  selectedIssues: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(["clear-selection"]);

const issueIds = $computed(() =>
  selectedIssues.map(
    (issueNumberAndUser) => issueNumberAndUser.split("-id-")[1]
  )
);

const issuesWithMultipleCopiesSelected = $computed(() =>
  Object.entries(
    selectedIssues.reduce((acc, issueNumberAndUser) => {
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
