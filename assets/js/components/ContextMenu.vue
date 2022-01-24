<template>
  <v-contextmenu-group>
    <li class="header">
      {{ $tc("{count} numéro sélectionné|{count} numéros sélectionnés", selectedIssues.length) }}
    </li>
    <b-alert
      v-if="!editingCopies.length"
      class="text-center m-0"
      show
      variant="danger"
      v-html="$t('Vous allez retirer tous les exemplaires<br />des numéros sélectionnés')"
    />
    <b-alert
      v-if="copies.length && !isSingleIssueSelected"
      class="text-center m-0"
      show
      variant="warning"
      v-html="$t('Vous possédez certains numéros sélectionnés<br />en plusieurs exemplaires.<br />Seul le premier exemplaire sera modifié.')"
    />
    <b-alert
      v-if="!selectedIssues.length"
      class="text-center m-0"
      show
      variant="warning"
      v-html="$t('Sélectionnez un ou plusieurs numéros dans la liste<br />pour les ajouter, modifier ou supprimer de votre collection.')"
    />
    <template v-else>
      <b-tabs
        v-model="currentCopyIndex"
        nav-class="copies-tabs"
        @changed="(newTabs) => { currentCopyIndex = newTabs.length - 1 }"
      >
        <b-tab
          v-for="(copy, copyIndex) in editingCopies"
          :key="`copy-${copyIndex}`"
        >
          <template #title>
            {{ $t("Exemplaire") }} {{ copyIndex + 1 }}
            <b-icon
              icon="trash"
              @click.stop.prevent="editingCopies.splice(copyIndex, 1)"
            />
          </template>
          <v-contextmenu-group :title="$t('Etat')">
            <v-contextmenu-item
              v-for="(text, id) in conditionStates"
              :key="`condition-${id}`"
              :hide-on-click="false"
              :class="{clickable: true, selected: copy.condition === id}"
              @click="copy.condition = id"
            >
              <Condition
                :value="id"
              />&nbsp;{{ text }}
            </v-contextmenu-item>
            <v-contextmenu-divider />
          </v-contextmenu-group>
          <v-contextmenu-group :title="$t('Date d\'achat')">
            <template
              v-for="(purchaseStateText, purchaseStateId) in purchaseStates"
              :key="`copy-${copyIndex}-purchase-state-${purchaseStateId}`"
            >
              <v-contextmenu-item
                v-if="purchaseStateId !== 'link'"
                :hide-on-click="false"
                :class="{clickable: true, selected: copy.purchaseId === purchaseStateId, 'purchase-state': true, 'v-context__sub': purchaseStateId === 'link', [purchaseStateId]: true }"
                @click="copy.purchaseId = purchaseStateId"
              >
                <b-icon
                  v-if="purchaseStateId === 'unlink'"
                  icon="calendar-x"
                />
                {{ purchaseStateText }}
              </v-contextmenu-item>
              <v-contextmenu-submenu
                v-else
                :title="$t(`Date d'achat`)"
              >
                <template #title>
                  <b-icon
                    v-if="purchaseStateId === 'link'"
                    icon="calendar"
                  />
                  {{ purchaseStateText }}
                </template>
                <li class="menu-separator">
                  <v-contextmenu-item
                    v-if="!copy.newPurchaseContext"
                    @click="copy.newPurchaseContext = !copy.newPurchaseContext"
                  >
                    {{ $t("Nouvelle date d'achat...") }}
                  </v-contextmenu-item>
                  <template v-else>
                    <input
                      v-model="copy.newPurchaseDescription"
                      required
                      type="text"
                      class="form-control"
                      size="30"
                      maxlength="30"
                      :placeholder="$t('Description')"
                    >
                    <input
                      v-model="copy.newPurchaseDate"
                      required
                      type="date"
                      class="form-control"
                      size="30"
                      maxlength="10"
                      :placeholder="$t(`Date d'achat`)"
                      @keydown.prevent="() => {}"
                    >
                    <b-button
                      @click="
                        $emit('create-purchase', {
                          date: copy.newPurchaseDate,
                          description: copy.newPurchaseDescription,
                        });
                        copy.newPurchaseDescription = copy.newPurchaseDate = null;
                        copy.newPurchaseContext = false"
                    >
                      {{ $t("Créer") }}
                    </b-button>
                    <b-button
                      class="cancel"
                      @click="copy.newPurchaseContext = false"
                    >
                      {{ $t("Annuler") }}
                    </b-button>
                  </template>
                </li>
                <v-contextmenu-group :title="$t('Date d\'achat')">
                  <v-contextmenu-item
                    v-for="{id: purchaseId, date, description} in purchases"
                    :key="`copy-${copyIndex}-purchase-${purchaseId}`"
                    :hide-on-click="false"
                    :class="{clickable: true, selected: copy.purchaseId === purchaseId, 'purchase-date': true}"
                    @click.stop="copy.purchaseId = purchaseId"
                  >
                    {{ description }}<br><small>{{ date }}</small>
                    <b-button
                      class="delete-purchase btn-sm"
                      :title="$t('Supprimer')"
                      @click="
                        $emit('delete-purchase', {
                          id: purchaseId,
                        })"
                    >
                      <b-icon icon="trash" />
                    </b-button>
                  </v-contextmenu-item>
                </v-contextmenu-group>
              </v-contextmenu-submenu>
            </template>
          </v-contextmenu-group>
        </b-tab>
        <template
          v-if="!hasMaxCopies"
          #tabs-end
        >
          <b-nav-item
            v-if="isSingleIssueSelected || hasNoCopies"
            class="p-0"
            role="presentation"
            @click="editingCopies.push({...defaultState})"
          >
            {{ $t("Ajouter un exemplaire") }}
          </b-nav-item>
          <b-nav-item
            v-else
            class="p-0 disabled text-secondary"
            role="presentation"
            :title="$t(`Vous pouvez seulement ajouter un exemplaire lorsqu'un seul numéro est sélectionné`)"
          >
            {{ $t("Ajouter un exemplaire") }}
          </b-nav-item>
        </template>
      </b-tabs>
      <li
        class="footer clickable"
        @click="updateSelectedIssues"
      >
        {{ $t("Enregistrer les changements") }}
      </li>
    </template>
  </v-contextmenu-group>
</template>

<script>
import "v-contextmenu/dist/themes/default.css";

import conditionMixin from "../mixins/conditionMixin";
import Condition from "./Condition";
import {BAlert, BIcon, BNavItem, BTab, BTabs} from "bootstrap-vue-3";
import { directive, Contextmenu, ContextmenuItem, ContextmenuSubmenu, ContextmenuDivider, ContextmenuGroup } from "v-contextmenu";
import {mapActions} from "pinia";
import {l10n} from "../stores/l10n";

export default {
  name: "ContextMenu",
  directives: {
    'v-contextmenu': directive,
  },
  components: {
    [Contextmenu.name]: Contextmenu,
    [ContextmenuItem.name]: ContextmenuItem,
    [ContextmenuSubmenu.name]: ContextmenuSubmenu,
    [ContextmenuDivider.name]: ContextmenuDivider,
    [ContextmenuGroup.name]: ContextmenuGroup,
    Condition,
    BAlert,
    BTabs,BTab,BIcon,BNavItem
  },

  mixins: [conditionMixin],
  props: {
    publicationCode: {
      type: String, required: true
    },
    selectedIssues: {
      type: Array, required: true
    },
    copies: {
      type: Array, required: true
    },
    purchases: {
      type: Array, required: true
    }
  },
  emits: ["update-issues", "create-purchase", "delete-purchase", "close"],
  data: () => ({
    defaultState: {
      condition: "do_not_change",
      isToSell: "do_not_change",
      purchaseId: "do_not_change"
    },
    newPurchaseContext: false,
    newPurchaseDescription: "",
    newPurchaseDate: "",
    editingCopies: [],
    currentCopyIndex: 0
  }),

  computed: {
    conditionStates() {
      return {
        ...(this.isSingleIssueSelected ? {} : {
          do_not_change: this.$t("Conserver l'état actuel")
        }),
        missing: this.$t("Marquer comme non-possédé(s)"),
        possessed: this.$t("Marquer comme possédé(s)"),
        bad: this.$t("Marquer comme en mauvais état"),
        notsogood: this.$t("Marquer comme en état moyen"),
        good: this.$t("Marquer comme en bon état")
      };
    },
    purchaseStates() {
      return {
        ...(this.isSingleIssueSelected ? {} : {
          do_not_change: this.$t("Conserver la date d'achat")
        }),
        link: this.$t("Associer avec une date d'achat"),
        unlink: this.$t("Désassocier de la date d'achat")
      };
    },
    isSingleIssueSelected() {
      return this.selectedIssues.length === 1;
    },
    hasNoCopies() {
      return !this.editingCopies.length;
    },
    hasMaxCopies() {
      return this.editingCopies.length >= 3;
    }
  },

  watch: {
    selectedIssues: {
      immediate: true,
      handler() {
        this.updateEditingCopies();
      }
    },
    copies: {
      immediate: true,
      handler() {
        this.updateEditingCopies();
      }
    }
  },

  methods: {
    ...mapActions(l10n, ["$r"]),
    test() {
      console.log('test')
    },
    updateEditingCopies() {
      if (this.selectedIssues.length === 1) {
        if (this.copies.length) {
          this.editingCopies = JSON.parse(JSON.stringify(this.copies));
        } else {
          this.editingCopies = [{ ...this.defaultState, condition: "missing" }];
        }
      } else {
        this.editingCopies = [{ ...this.defaultState }];
      }
    },
    convertConditionToDbValue(condition) {
      return (this.conditions.find(({ value }) => value === condition) || { dbValue: null }).dbValue;
    },

    async updateSelectedIssues() {
      const vm = this;
      let issueDetails = {
        condition: this.editingCopies.map(({ condition }) => vm.convertConditionToDbValue(condition)),
        istosell: this.editingCopies.map(({ isToSell }) => isToSell),
        purchaseId: this.editingCopies.map(({ purchaseId }) => purchaseId)
      };
      if (!this.isSingleIssueSelected) {
        issueDetails = Object.keys(issueDetails).reduce((acc, detailKey) => ({
          ...acc,
          [detailKey]: issueDetails[detailKey][0]
        }), {});
      }

      this.$refs.menu.close();
      this.$emit("update-issues", {
        publicationCode: this.publicationCode,
        issueNumbers: this.selectedIssues,
        ...issueDetails
      });
    },
    async createPurchaseDate() {
      this.$emit("create-purchase", {
        date: this.newPurchaseDate,
        description: this.newPurchaseDescription
      });
    }
  }
};
</script>

<style lang="scss">
.v-contextmenu-inner {
  &, li, .v-contextmenu-group__menus {
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

    &.clickable:hover {
      background-color: #4f5b69 !important;
      color: #fff;
      cursor: pointer;
    }

    &.header, &.clone, &.footer {
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
      padding: .2em;
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
            content: '>'
          }
        }
      }

      &.purchase-date {
        align-items: start;
        justify-content: center;
        flex-direction: column;
        background-repeat: no-repeat;
        background-size: 12px;
        background-position-x: 10px;
        line-height: 20px;

        .delete-purchase {
          position: absolute;
          right: 0;
          top: calc(50% - 11px);
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
