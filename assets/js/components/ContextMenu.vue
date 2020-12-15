<template>
  <vue-context
    ref="menu"
    :close-on-click="false"
    :close-on-scroll="false"
  >
    <li class="header">
      {{ selectedIssues.length }}
      <template v-if="selectedIssues.length <= 1">
        {{ l10n.NUMERO_SELECTIONNE }}
      </template>
      <template v-else>
        {{ l10n.NUMEROS_SELECTIONNES }}
      </template>
    </li>
    <li class="menu-separator">
      {{ l10n.ETAT }}
    </li>
    <li
      v-for="(textKey, id) in conditionStates"
      :key="`condition-${id}`"
      :class="{item: true, selected: condition === id, 'issue-condition': true, [`issue-condition-${id}`]: true}"
      @click="condition = id"
    >
      {{ l10n[textKey] }}
    </li>
    <li class="menu-separator">
      {{ l10n.ACHAT_DATE_ACHAT }}
    </li>
    <li
      v-for="(textKey, id) in purchaseStates"
      :key="`purchase-${id}`"
      :class="{item: true, selected: currentPurchaseId === id, 'purchase-state': true, 'v-context__sub': id === 'link' }"
      :style="id === 'do_not_change' ? {} : {backgroundImage: `url(${imagePath}/icons/purchase-${id}.png`}"
      @click="currentPurchaseId = id"
    >
      {{ l10n[textKey] }}
      <ul
        v-if="id === 'link'"
        class="v-context"
      >
        <li class="menu-separator">
          <h5
            v-if="!newPurchaseContext"
            @click="newPurchaseContext = !newPurchaseContext"
          >
            {{ l10n.ACHAT_NOUVELLE_DATE_ACHAT }}
          </h5>
          <template v-else>
            <input
              v-model="newPurchaseDescription"
              required
              type="text"
              class="form-control"
              size="30"
              maxlength="30"
              :placeholder="l10n.ACHAT_DESCRIPTION"
            >
            <input
              v-model="newPurchaseDate"
              required
              type="date"
              class="form-control"
              size="30"
              maxlength="10"
              :placeholder="l10n.ACHAT_DATE_ACHAT"
              @keydown.prevent="() => {}"
            >
            <button
              class="btn btn-default"
              @click="createPurchaseDate()
                      newPurchaseDescription = newPurchaseDate = null
                      newPurchaseContext = false"
            >
              {{ l10n.CREER }}
            </button>
            <button
              class="btn btn-default cancel"
              @click="newPurchaseContext = false"
            >
              {{ l10n.ANNULER }}
            </button>
          </template>
        </li>
        <li
          v-for="{id: purchaseId, date, description} in purchases"
          :key="purchaseId"
          :class="{item: true, selected: currentPurchaseId === purchaseId, 'purchase-date': true}"
          class="item purchase-date"
          :style="id === 'do_not_change' ? {} : {backgroundImage: `url(${imagePath}/icons/purchase-link.png`}"
          @click.stop="currentPurchaseId = purchaseId"
        >
          <b>{{ description }}</b><br>{{ date }}
        </li>
      </ul>
    </li>
    <li class="menu-separator">
      {{ l10n.A_VENDRE_TITRE }}
    </li>
    <li
      v-for="(textKey, id) in toSellStates"
      :key="`forsale-${id}`"
      :class="{item: true, selected: isToSell === id, 'forsale-state': true}"
      :style="id === 'do_not_change' ? {} : {backgroundImage: `url(${imagePath}/icons/${id}.png`}"
      @click="isToSell = id"
    >
      {{ l10n[textKey] }}
    </li>
    <li
      class="footer"
      @click="updateSelectedIssues"
    >
      {{ l10n.ENREGISTRER_CHANGEMENTS }}
    </li>
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
  emits: ['update-issues', 'create-purchase'],
  data: () => ({
    condition: 'do_not_change',
    isToSell: 'do_not_change',
    currentPurchaseId: 'do_not_change',
    newPurchaseContext: false,
    newPurchaseDescription: '',
    newPurchaseDate: '',
    conditionStates: {
      do_not_change: 'ETAT_CONSERVER_ETAT_ACTUEL',
      missing: 'ETAT_MARQUER_NON_POSSEDE',
      possessed: 'ETAT_MARQUER_POSSEDE',
      bad: 'ETAT_MARQUER_MAUVAIS_ETAT',
      notsogood: 'ETAT_MARQUER_ETAT_MOYEN',
      good: 'ETAT_MARQUER_BON_ETAT'
    },
    purchaseStates: {
      do_not_change: 'ACHAT_CONSERVER_DATE_ACHAT',
      link: 'ACHAT_ASSOCIER_DATE_ACHAT',
      unlink: 'ACHAT_DESASSOCIER_DATE_ACHAT'
    },
    toSellStates: {
      do_not_change: 'VENTE_CONSERVER_VOLONTE_VENTE',
      for_sale: 'VENTE_MARQUER_A_VENDRE',
      not_for_sale: 'VENTE_MARQUER_PAS_A_VENDRE'
    }
  }),

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

  li {
    padding: 0 30px;

    &.item:hover, &.footer:hover {
      background-color: #4f5b69 !important;
      color: #fff;
      cursor: pointer;
    }

    &.header, &.footer {
      height: 30px;
      line-height: 25px;
      font-size: 14px;
      background-color: #3d4b5f;
      color: white;
      padding: 2px;
      font-weight: bold;
      text-align: center;

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
        background-repeat: no-repeat;
        background-position-x: 6px;
      }

      &.purchase-date {
        flex-direction: column;
        background-repeat: no-repeat;
        background-size: 12px;
        background-position-x: 10px;
        line-height: 15px;
      }

      &.forsale-state {
        background-repeat: no-repeat;
        background-position-x: 4px;
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
        * {
          color: black;
        }

        .item {
          line-height: 15px;
          padding-top: 10px;

          &:hover {
            color: white;
          }
        }
      }
    }
  }
}
</style>