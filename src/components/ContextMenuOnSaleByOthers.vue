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
      class="footer clickable pre-wrap"
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
.v-contextmenu-inner {
  &,
  li,
  .v-contextmenu-group__menus {
    padding: 0 !important;
  }

  :deep(.copies-tabs) {
    position: initial;
    display: flex;
    padding-bottom: 0;
    padding-top: 0;
  }

  .nav-item:not(.disabled) .nav-link {
    color: #212529 !important;
    cursor: pointer;
  }

  li {
    &.disabled {
      a {
        background: initial;
        border: initial;
        color: inherit;
        cursor: not-allowed;
      }
    }

    &.clickable {
      padding: 5px !important;
      height: 60px !important;
      &:hover {
        background-color: #4f5b69 !important;
        color: #fff;
        cursor: pointer;
      }
    }

    &.header,
    &.clone,
    &.footer {
      height: 30px;
      line-height: 25px;
      font-size: 14px;
      background-color: #3d4b5f;
      color: white;
      padding: 2px;
      font-weight: bold;
      text-align: center;

      &.clone {
        background-color: #308290;
        cursor: pointer;

        &.disabled:hover {
          cursor: default;
        }
      }

      &.footer {
        background-color: green;
        border-top: 3px solid #e6e6e6;
      }
    }

    &.menu-separator {
      color: black;
      font-size: 12px;
      font-weight: bold;
      line-height: 20px;
      text-align: center;
      border: 1px solid #e6e6e6;
      border-top-width: 3px;
      padding: 0.2em;
    }

    .v-contextmenu-item {
      display: flex;
      align-items: center;
      color: black;
      line-height: 25px;
      background-position: left center;
      padding: 0 12px !important;

      &.selected {
        background-color: #a52a2a;
        color: white;
      }

      &.purchase-state {
        &.link {
          &:after {
            position: absolute;
            font-weight: bold;
            right: 10px;
            content: ">";
          }
        }
      }

      &.purchase-date {
        justify-content: space-between;
        background-repeat: no-repeat;
        background-size: 12px;
        background-position-x: 10px;
        line-height: 25px;

        .date {
          width: 70px;
        }
      }

      :deep(.issue-condition) {
        margin-right: 8px;
      }

      > svg {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}
</style>
