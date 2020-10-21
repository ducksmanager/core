<template>
  <span>
    <span :id="id">
      <slot />
    </span>
    <b-popover
      :target="id"
      placement="top"
      triggers="hover focus manual"
    >
      <template #title><Issue
        :publicationcode="publicationcode"
        :issuenumber="issueNumber"
        :publicationname="publicationName"
      /></template>
      <div>
        {{ l10n.DECOUVRIR_COUVERTURE }}.
        <div
          v-if="!hasEdge"
          class="has-no-edge"
        >
          {{ l10n.TRANCHE_NON_DISPONIBLE1 }}<br>
          <div v-if="!isBookcaseShare">
            {{ l10n.TRANCHE_NON_DISPONIBLE2 }}<br>
            <div class="progress-wrapper">
              <MedalProgress :current-level="currentLevel" />
              <div>
                <b-progress-bar
                  class="progress-current"
                  :style="{width: `${medalProgressCurrentPercentage}%`}"
                />
                <b-progress-bar
                  class="progress-extra"
                  striped
                  variant="success"
                  :style="{width: `${medalProgressExtraPercentage}%`}"
                >
                  {{ extraPoints }}
                </b-progress-bar>
              </div>
            </div>
            <div class="progress-info">
              {{ l10n.TRANCHE_NON_DISPONIBLE3 }}
              <span>{{ extraPoints }}</span> {{ l10n.POINTS }} !
            </div>
            <br>
            <b-btn
              variant="info"
              href="https://edgecreator.ducksmanager.net"
              target="_blank"
            >
              {{ l10n.ENVOYER_PHOTO_DE_TRANCHE }}
            </b-btn>
          </div>
        </div>
      </div>
    </b-popover>
  </span>
</template>

<script>
import Issue from "./Issue";
import l10nMixin from "../mixins/l10nMixin";
import MedalProgress from "./MedalProgress";

export default {
  name: "IssueEdgePopover",
  components: {MedalProgress, Issue},
  mixins: [l10nMixin],
  props: {
    publicationcode: {
      type: String,
      required: true
    },
    publicationName: {
      type: String,
      required: true
    },
    issueNumber: {
      type: String,
      required: true
    },
    hasEdge: {
      type: Boolean,
      required: true
    },
    isBookcaseShare: {
      type: Boolean,
      required: true
    },
    userPoints: {
      type: Number,
      default: null
    },
    currentLevelPoints: {
      type: Number,
      default: null
    },
    currentLevel: {
      type: Number,
      default: 0
    },
    currentLevelThreshold: {
      type: Number,
      default: null
    },
    extraPoints: {
      type: Number,
      default: null
    }
  },

  computed: {
    medalProgressCurrentPercentage() {
      return 100 * (this.userPoints - this.currentLevelPoints) / (this.currentLevelThreshold - this.currentLevelPoints)
    },
    medalProgressExtraPercentage() {
      return this.currentLevelThreshold ? (100 * (this.extraPoints / this.currentLevelThreshold - this.currentLevelPoints)) : 0
    },
    id() {
      return `${this.publicationcode} ${this.issueNumber}`
    }
  }
}
</script>

<style scoped lang="scss">

.has-no-edge {
  margin-top: 25px;
}

.progress-current {
  background-color: lightgreen !important;
}

.progress-extra {
  color: rgb(40,40,40) !important;
  background-image: linear-gradient(135deg, #268026 25%, transparent 25%, transparent 50%, #268026 50%, #268026 75%, transparent 75%, transparent);
  text-shadow: 1px 1px 2px lightgrey;
  white-space: nowrap;
  overflow-x: visible;
  animation-direction: reverse;
}
</style>