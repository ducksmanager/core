<template>
  <vue-context
    ref="menu"
    :close-on-click="false"
    :close-on-scroll="false"
  >
    <ul>
      <li class="header">
        {{ $tc("{count} numéro sélectionné|{count} numéros sélectionnés", selectedIssues.length) }}
      </li>
      <b-tabs
        v-model="currentCopyIndex"
        nav-class="copies-tabs"
      >
        <b-tab
          v-for="(copy, copyIndex) in copies"
          :key="`copy-${copyIndex}`"
        >
          <template #title>
            Copy {{ copyIndex + 1 }}
            <b-icon-trash @click="copies.splice(copyIndex, 1)" />
          </template>
          <ul class="position-static border-0 shadow-none p-0">
            <li class="menu-separator">
              {{ $t('Etat') }}
            </li>
            <li
              v-for="(text, id) in conditionStates"
              :key="`condition-${id}`"
              :class="{item: true, selected: copy.condition === id, 'issue-condition': true, [`issue-condition-${id}`]: true}"
              @click="copy.condition = id"
            >
              {{ text }}
            </li>
            <li class="menu-separator">
              {{ $t('Date d\'achat') }}
            </li>
            <li
              v-for="(purchaseStateText, purchaseStateId) in purchaseStates"
              :key="`copy-${copyIndex}-purchase-state-${purchaseStateId}`"
              :class="{item: true, selected: copy.currentPurchaseId === purchaseStateId, 'purchase-state': true, 'v-context__sub': purchaseStateId === 'link', [purchaseStateId]: true }"
              @click="copy.currentPurchaseId = purchaseStateId"
            >
              <b-icon-calendar v-if="purchaseStateId === 'link'" />
              <b-icon-calendar-x v-if="purchaseStateId === 'unlink'" />
              {{ purchaseStateText }}
              <ul
                v-if="purchaseStateId === 'link'"
                class="v-context"
              >
                <li class="menu-separator">
                  <h5
                    v-if="!copy.newPurchaseContext"
                    @click="copy.newPurchaseContext = !copy.newPurchaseContext"
                  >
                    {{ $t('Nouvelle date d\'achat...') }}
                  </h5>
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
                      :placeholder="$t('Date d\'achat')"
                      @keydown.prevent="() => {}"
                    >
                    <b-btn
                      @click="
                        $emit('create-purchase', {
                          date: copy.newPurchaseDate,
                          description: copy.newPurchaseDescription,
                        })
                        copy.newPurchaseDescription = copy.newPurchaseDate = null
                        copy.newPurchaseContext = false"
                    >
                      {{ $t('Créer') }}
                    </b-btn>
                    <b-btn
                      class="cancel"
                      @click="copy.newPurchaseContext = false"
                    >
                      {{ $t('Annuler') }}
                    </b-btn>
                  </template>
                </li>
                <li
                  v-for="{id: purchaseId, date, description} in purchases"
                  :key="`copy-${copyIndex}-purchase-${purchaseId}`"
                  :class="{item: true, selected: copy.currentPurchaseId === purchaseId, 'purchase-date': true}"
                  class="item purchase-date"
                  @click.stop="copy.currentPurchaseId = purchaseId"
                >
                  <b>{{ description }}</b><br>{{ date }}<b-btn
                    class="delete-purchase btn-sm"
                    :title="$t('Supprimer')"
                    @click="
                      $emit('delete-purchase', {
                        id: purchaseId,
                      })"
                  >
                    <b-icon-trash />
                  </b-btn>
                </li>
              </ul>
            </li>
            <li
              class="footer"
              @click="updateSelectedIssues"
            >
              {{ $t('Enregistrer les changements') }}
            </li>
          </ul>
        </b-tab>
        <template #tabs-end>
          <b-nav-item
            v-if="!hasMaxCopies"
            :class="{'p-0': true, disabled: selectedIssues.length !== 1}"
            role="presentation"
            :title="selectedIssues.length === 1 ? null : $t('Vous pouvez seulement ajouter un exemplaire lorsqu\'un seul numéro est sélectionné')"
            @click="selectedIssues.length === 1 ? copies.push({...defaultState}) : () => {}"
          >
            {{ $t('Ajouter un exemplaire') }}
          </b-nav-item>
        </template>
      </b-tabs>
    </ul>
  </vue-context>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import VueContext from "vue-context";
import conditionMixin from "../mixins/conditionMixin";

export default {
  name: "ContextMenu",
  components: {
    VueContext
  },
  mixins: [l10nMixin, conditionMixin],
  props: {
    publicationCode: {
      type: String, required: true
    },
    selectedIssues: {
      type: Array, required: true
    },
    purchases: {
      type: Array, required: true
    },
  },
  emits: ['update-issues', 'create-purchase', 'delete-purchase'],
  data: () => ({
    defaultState: {
      condition: 'do_not_change',
      isToSell: 'do_not_change',
      currentPurchaseId: 'do_not_change',
    },
    newPurchaseContext: false,
    newPurchaseDescription: '',
    newPurchaseDate: '',
    copies: [],
    currentCopyIndex: 0
  }),

  computed: {
    conditionStates() {
      return {
        do_not_change: this.$t("Conserver l'état actuel"),
        missing: this.$t("Marquer comme non-possédé(s)"),
        possessed: this.$t("Marquer comme possédé(s)"),
        bad: this.$t("Marquer comme en mauvais état"),
        notsogood: this.$t("Marquer comme en état moyen"),
        good: this.$t("Marquer comme en bon état")
      }
    },
    purchaseStates() {
      return {
        do_not_change: this.$t("Conserver la date d'achat"),
        link: this.$t("Associer avec une date d'achat"),
        unlink: this.$t("Désassocier de la date d'achat")
      }
    },
    hasMaxCopies() {
      return this.copies.length >= 3
    }
  },

  mounted() {
    this.copies = [{ ...this.defaultState }]
  },

  methods: {
    async updateSelectedIssues() {
      const vm = this
      this.$emit('update-issues', {
        publicationCode: this.publicationCode,
        issueNumbers: this.selectedIssues,
        condition: (vm.conditions.find(({value}) => value === vm.condition) || {dbValue: null}).dbValue,
        istosell: this.isToSell,
        purchaseId: this.currentPurchaseId
      })
    },
    async createPurchaseDate() {
      this.$emit('create-purchase', {
        date: this.newPurchaseDate,
        description: this.newPurchaseDescription,
      })
    }
  }
}
</script>

<style scoped lang="scss">
.v-context {
  padding: 0;

  ::v-deep .copies-tabs {
    position: initial;
    display: flex;
    padding-bottom: 0;
  }

  li {
    padding: 0 30px;

    &.disabled {
      a {
        background: initial;
        border: initial;
        cursor: not-allowed;
      }
    }

    &.item:hover, &.footer:hover {
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

    &.item {
      display: flex;
      align-items: center;
      color: black;
      line-height: 25px;
      background-position: left center;

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
        flex-direction: column;
        background-repeat: no-repeat;
        background-size: 12px;
        background-position-x: 10px;
        line-height: 15px;

        .delete-purchase {
          position: absolute;
          right: 0;
          top: calc(50% - 11px);
        }
      }

      &.issue-condition:before {
        position: absolute;
        left: 0;
        content: " ";
        width: 0;
        height: 0;
        border-radius: 50%;
        margin: 6px;
      }

      &.issue-condition-missing:before {
        border: 8px solid black;
      }

      &.issue-condition-bad:before {
        border: 8px solid red;
      }

      &.issue-condition-notsogood:before {
        border: 8px solid orange;
      }

      &.issue-condition-good:before {
        border: 8px solid #2CA77B;
      }

      &.issue-condition-possessed:before {
        border: 8px solid #808080;
      }

      &.v-context__sub {
        .item {
          line-height: 15px;
          padding-top: 10px;

          &:hover {
            color: white;
          }
        }
      }

      > svg {
        margin-left: -24px;
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}
</style>
