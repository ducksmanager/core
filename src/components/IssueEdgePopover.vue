<template>
  <Popover>
    <span>
      <slot />
    </span>
    <template #header>
      <slot name="title" />
    </template>
    <template #content>
      <div>
        {{ $t("Cliquez sur la tranche pour parcourir ce numéro") }}.
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
                contribution="edge_photographer"
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
    </template>
  </Popover>
</template>

<script setup lang="ts">
import { BButton } from "bootstrap-vue-3";

import { bookcase } from "~/stores/bookcase";
import { collection } from "~/stores/collection";
import { users } from "~/stores/users";

const { extraPoints = null } = defineProps<{
  hasEdge: boolean;
  extraPoints?: number;
}>();

const contribution = "edge_photographer";
const isSharedBookcase = bookcase().isSharedBookcase;
const user = $computed(() => collection().user);
const points = $computed(() => user && users().points?.[user.id][contribution]);
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
