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
        {{ $t("Cliquez sur la tranche pour découvrir sa couverture") }}.
        <div v-if="!hasEdge" class="has-no-edge">
          {{
            $t(
              "Cette tranche n'est pas visible car nous n'en possédons pas de photographie..."
            )
          }}<br />
          <div v-if="!isSharedBookcase">
            {{ $t("Vous pouvez photographier cette tranche ?") }}<br />
            <div class="medal-progress-wrapper">
              <MedalProgress
                contribution="Photographe"
                :user-level-points="points"
                :extra-points="extraPoints"
              />
            </div>
            <div class="progress-info">
              {{ $t("Envoyez-nous une photo et gagnez") }}
              <span>{{ extraPoints }}</span> {{ $t("Points") }} !
            </div>
            <br />
            <b-button
              variant="info"
              href="https://edgecreator.ducksmanager.net"
              target="_blank"
            >
              {{ $t("Envoyer une photo de tranche") }}
            </b-button>
          </div>
        </div>
      </div>
    </b-popover>
  </span>
</template>

<script setup>
import { BButton, BPopover } from "bootstrap-vue-3";

import { bookcase } from "../stores/bookcase";
import { users } from "../stores/users";
import MedalProgress from "./MedalProgress";

const { userId } = user();

defineProps({
  id: {
    type: String,
    required: true,
  },
  hasEdge: {
    type: Boolean,
    required: true,
  },
  extraPoints: {
    type: Number,
    default: null,
  },
});

const contribution = "Photographe";
const isSharedBookcase = bookcase().isSharedBookcase;
const points = $computed(() => users().points[userId]?.[contribution]);
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
      &.left,
      &.right {
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
