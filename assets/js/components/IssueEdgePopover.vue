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
        {{ $t('Cliquez sur la tranche pour découvrir sa couverture') }}.
        <div
          v-if="!hasEdge"
          class="has-no-edge"
        >
          {{ $t("Cette tranche n'est pas visible car nous n'en possédons pas de photographie...") }}<br>
          <div v-if="!isSharedBookcase">
            {{ $t('Vous pouvez photographier cette tranche ?') }}<br>
            <div class="medal-progress-wrapper">
              <MedalProgress
                contribution="Photographe"
                :user-level-points="points"
                :extra-points="extraPoints"
              />
            </div>
            <div class="progress-info">
              {{ $t('Envoyez-nous une photo et gagnez') }}
              <span>{{ extraPoints }}</span> {{ $t('Points') }} !
            </div>
            <br>
            <b-button
              variant="info"
              href="https://edgecreator.ducksmanager.net"
              target="_blank"
            >
              {{ $t('Envoyer une photo de tranche') }}
            </b-button>
          </div>
        </div>
      </div>
    </b-popover>
  </span>
</template>

<script>
import MedalProgress from "./MedalProgress";
import {mapState} from "pinia";
import {BButton, BPopover} from "bootstrap-vue-3";
import { users } from "../stores/users";
import { bookcase } from "../stores/bookcase";
import {user} from "../composables/global";
const {userId} = user()

export default {
  name: "IssueEdgePopover",
  components: {MedalProgress, BPopover, BButton},
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
    ...mapState(bookcase, ["isSharedBookcase"]),
    ...mapState(users, {allUserPoints: "points"}),

    points() {
      return this.allUserPoints && this.allUserPoints[userId][this.contribution]
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

    :deep(.wrapper) {
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
