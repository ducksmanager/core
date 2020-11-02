<template>
  <div v-if="l10n && publicationName && issues && purchases">
    <Country :country="country" />
    <span class="publication-title">{{ publicationName }}</span>
    <div class="issue-filter">
      <table>
        <tr
          v-for="conditionFilter in ['possessed', 'missing']"
          :key="conditionFilter"
        >
          <td>
            <input
              :id="`show-${conditionFilter}`"
              v-model="filter[conditionFilter]"
              type="checkbox"
            >
          </td>
          <td>
            <label :for="`show-${conditionFilter}`">
              <template v-if="conditionFilter === 'possessed'">{{ l10n.AFFICHER_NUMEROS_POSSEDES }}</template>
              <template v-else-if="conditionFilter === 'missing'">{{ l10n.AFFICHER_NUMEROS_MANQUANTS }}</template>
              ({{
                issues.filter(issue => conditionFilter === 'possessed' ? issue.condition : !issue.condition).length
              }})
            </label>
          </td>
        </tr>
      </table>
    </div>
    <div
      class="issue-list"
      @contextmenu.prevent="$refs.contextMenu.$refs.menu.open"
    >
      <b-alert
        v-once
        show
        variant="info"
        style="margin-bottom: 0"
      >
        {{ l10n.INFO_AJOUT_NUMEROS_1 }}
        <span v-if="isTouchScreen">{{ l10n.INFO_AJOUT_NUMEROS_2_MOBILE }}</span>
        <span v-else>{{ l10n.INFO_AJOUT_NUMEROS_2_DESKTOP }}</span>
      </b-alert>
      <Book
        v-if="currentIssueOpened"
        :publication-code="currentIssueOpened.publicationcode"
        :issue-number="currentIssueOpened.issueNumber"
        @close-book="currentIssueOpened = null"
      />
      <div
        v-for="({issueNumber, title, condition, purchaseId, isToSell}, i) in filteredIssues"
        :key="issueNumber"
        :class="{
          issue: true,
          [`issue-${condition ? 'possessed' : 'missing'}`]: true,
          preselected: preselected.includes(issueNumber),
          selected: selected.includes(issueNumber)
        }"
        :title="`${l10n.NUMERO_COURT}${issueNumber}`"
        @mousedown.self.left="preselectedIndexStart = preselectedIndexEnd = i"
        @mouseup.self.left="updateSelected"
        @mouseover="preselectedIndexEnd = preselectedIndexStart === null ? null : i"
      >
        <a :name="issueNumber" />
        <IssueDetailsPopover
          v-once
          :publication-code="publicationcode"
          :issue-number="issueNumber"
          placement="right"
        >
          <img
            class="preview"
            :src="`${imagePath}/icons/view.png`"
            :alt="l10n.VOIR"
            @click.prevent="currentIssueOpened = {publicationcode, issueNumber}"
          >
        </IssueDetailsPopover>
        <span
          v-once
          class="issue-text"
        >
          {{ l10n.NUMERO_COURT }}{{ issueNumber }}
          <span class="issue-title">{{ title }}</span>
        </span>
        <div
          class="issue-details-wrapper"
        >
          <div class="issue-details">
            <input
              type="checkbox"
              disabled
              :checked="selected.includes(issueNumber)"
              @click.prevent="false"
            >
          </div>
          <div
            v-if="condition"
            v-once
            :class="{
              'issue-details': true,
              'issue-condition': true
            }"
            :style="{backgroundColor: conditions.find(({value}) => value === condition).color}"
            :title="l10n[`ETAT_${condition}`]"
          />
          <div
            v-if="purchaseId && purchases.find(({id}) => id === purchaseId)"
            v-once
            class="issue-details issue-date"
          >
            <img
              :src="`${imagePath}/icons/date.png`"
              :title="`${l10n.ACHETE_LE} ${purchases.find(({id}) => id === purchaseId).date}`"
              :alt="`${l10n.ACHETE_LE} ${purchases.find(({id}) => id === purchaseId).date}`"
            >
          </div>
          <div
            v-else
            v-once
            class="issue-details"
          />
          <div class="issue-details">
            <img
              v-if="isToSell"
              height="16px"
              :src="`${imagePath}/icons/for_sale.png`"
              :alt="l10n.A_VENDRE"
              :title="l10n.A_VENDRE"
            >
          </div>
        </div>
      </div>
    </div>
    <ContextMenu
      ref="contextMenu"
      :publication-code="publicationcode"
      :selected-issues="selected"
      :purchases="purchases"
      @update-issues="updateIssues"
      @create-purchase="createPurchase"
    />
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapState} from "vuex";
import ContextMenu from "./ContextMenu";
import 'vue-context/src/sass/vue-context.scss';
import axios from "axios";
import conditionMixin from "../mixins/conditionMixin";
import collectionMixin from "../mixins/collectionMixin";
import Country from "./Country";
import IssueDetailsPopover from "./IssueDetailsPopover";
import Book from "./Book";

export default {
  name: "IssueList",
  components: {
    Book,
    Country,
    ContextMenu,
    IssueDetailsPopover
  },
  mixins: [l10nMixin, collectionMixin, conditionMixin],
  props: {
    publicationcode: {
      type: String,
      required: true
    }
  },
  data: () => ({
    filter: {
      missing: true,
      possessed: true,
    },
    coverUrl: null,
    issues: null,
    selected: [],
    preselected: [],
    preselectedIndexStart: null,
    preselectedIndexEnd: null,
    currentIssueOpened: null
  }),
  computed: {
    ...mapState("l10n", ["locale"]),
    ...mapState("coa", ["publicationNames"]),
    ...mapState("collection", {userIssues: "collection"}),

    country() {
      return this.publicationcode.split('/')[0]
    },
    publicationName() {
      return this.publicationNames && this.publicationNames[this.publicationcode]
    },
    imagePath: () => window.imagePath,

    isTouchScreen: () => window.matchMedia("(pointer: coarse)").matches,
    filteredIssues() {
      const vm = this
      return this.issues && this.issues.filter(issue =>
        vm.filter.possessed && issue.condition ||
        vm.filter.missing && !issue.condition
      )
    }
  },
  watch: {
    preselectedIndexEnd() {
      this.preselected = this.getPreselected()
    },
    userIssues: {
      immediate: true,
      async handler(newValue) {
        if (newValue) {
          const vm = this

          const userIssuesForPublication = newValue.filter(issue =>
            `${issue.country}/${issue.magazine}` === vm.publicationcode)
            .map(issue => ({
                ...issue,
                condition: (vm.conditions.find(({dbValue}) => dbValue === issue.condition) || {value: 'possessed'}).value
              })
            )

          this.issues = (await axios.get(`/api/coa/list/issues/${this.publicationcode}`)).data
            .map(issueNumber => ({
              issueNumber,
              ...(userIssuesForPublication.find(({issueNumber: userIssueNumber}) => userIssueNumber === issueNumber) || {})
            }))
        }
      }
    }
  },
  async mounted() {
    await this.loadPurchases()
    await this.fetchPublicationNames([this.publicationcode])
  },
  methods: {
    ...mapActions("coa", ["fetchPublicationNames"]),
    ...mapActions("collection", ["loadCollection", "loadPurchases"]),
    getPreselected() {
      const vm = this
      if ([this.preselectedIndexStart, this.preselectedIndexEnd].includes(null)) {
        return this.preselected
      }
      return this.issues
        .map(({issueNumber}) => issueNumber)
        .filter((issueNumber, i) =>
          i >= vm.preselectedIndexStart && i <= vm.preselectedIndexEnd
        )
    },
    updateSelected() {
      const vm = this
      this.selected = this.issues
        .map(({issueNumber}) => issueNumber)
        .filter(issueNumber => vm.selected.includes(issueNumber) !== vm.preselected.includes(issueNumber))
      this.preselectedIndexStart = this.preselectedIndexEnd = null
      this.preselected = []
    },
    async updateIssues(data) {
      await axios.post('/api/collection/issues', data)
      await this.loadCollection(true)
    },
    async createPurchase({date, description}) {
      await axios.post('/api/collection/purchases', {
        date,
        description,
      })
      await this.loadPurchases()
    }
  }
}
</script>

<style scoped lang="scss">
.publication-title {
  font-size: 15pt;
  font-weight: bold;
}

.issue-list-header {
  border: 0;
  width: 100%;
}

.issue-filter {
  float: right;
  white-space: nowrap;

  * {
    font-size: 11px;
  }
}

.issue-list {
  clear: both;
  user-select: none;

  .issue {
    width: 100%;
    background-color: black;
    cursor: default;
    height: 20px;

    &:hover {
      opacity: 0.7;
      filter: alpha(opacity=70);
      -moz-opacity: 0.7;
    }

    &.preselected {
      opacity: 0.7;
      filter: alpha(opacity=70);
    }

    &.selected {
      background-repeat: no-repeat;
      background-position: right center;
      outline: 1px solid white;
    }

    &.issue-possessed {
      background-color: rgb(200, 137, 100);
    }

    .issue-text {
      margin-left: 15px;
    }

    .issue-details-wrapper {
      display: inline;
      float: right;
      padding-right: 20px;
      padding-top: 2px;

      .issue-details {
        float: right;
        width: 14px;
        height: 14px;
        margin-right: 5px;

        &.issue-condition {
          border-radius: 50%;
        }
      }
    }
  }
}

@media (max-width: 767px) {
  .issue-text {
    float: left;
    white-space: nowrap;
    max-width: 170px;
    overflow-x: hidden;
  }

  .issue-details-wrapper {
    padding-right: 0;
  }
}

</style>