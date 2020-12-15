<template>
  <span>
    <span :id="id">
      <slot />
    </span>
    <b-popover
      :target="id"
      placement="top"
      :delay="0"
      triggers="hover focus manual"
    >
      <template #title><slot name="title" /></template>
      <div>
        {{ l10n.DECOUVRIR_COUVERTURE }}.
        <div
          v-if="!hasEdge"
          class="has-no-edge"
        >
          {{ l10n.TRANCHE_NON_DISPONIBLE1 }}<br>
          <div v-if="!isSharedBookcase">
            {{ l10n.TRANCHE_NON_DISPONIBLE2 }}<br>
            <div class="medal-progress-wrapper">
              <MedalProgress
                contribution="Photographe"
                :user-level-points="points"
                :extra-points="extraPoints"
              />
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
import l10nMixin from "../mixins/l10nMixin";
import MedalProgress from "./MedalProgress";
import {mapGetters, mapState} from "vuex";

export default {
  name: "IssueEdgePopover",
  components: {MedalProgress},
  mixins: [l10nMixin],
  props: {
    id: {
      type: String,
      required: true
    },
    hasEdge: {
      type: Boolean,
      required: true
    },
    extraPoints: {
      type: Number,
      default: null
    }
  },

  data: () => ({
    contribution: 'Photographe'
  }),

  computed: {
    ...mapGetters("bookcase", ["isSharedBookcase"]),
    ...mapState("users", {allUserPoints: "points"}),

    points() {
      return this.allUserPoints && this.allUserPoints[this.userId][this.contribution]
    },
  }
}
</script>

<style scoped lang="scss">
span {
  display: inline-block;
}
.has-no-edge {
  margin-top: 25px;

  .medal-progress-wrapper {
    position: relative;
    margin: 20px 0;

    ::v-deep .wrapper {
      &.left, &.right {
        top: -15px;
      }
      &.left {
        left: -10px;
      }
      &.right {
        right: -5px;
      }
    }
  }
}
</style>