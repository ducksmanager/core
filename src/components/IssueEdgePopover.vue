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
        <div v-t="'Cliquez sur la tranche pour parcourir ce numéro'"></div>
        <div v-if="!hasEdge" class="has-no-edge">
          <div
            v-t="
              'Cette tranche n\'est pas visible car nous n\'en possédons pas de photographie...'
            "
          ></div>
          <div v-if="!isSharedBookcase">
            <div v-t="'Vous pouvez photographier cette tranche ?'"></div>
            <div class="medal-progress-wrapper">
              <MedalProgress
                contribution="edge_photographer"
                :user-level-points="points"
                :extra-points="extraPoints"
              />
            </div>
            <i18n-t
              keypath="Envoyez-nous une photo et gagnez {points} points !"
              tag="div"
              class="progress-info"
            >
              <template #points>
                <span>{{ extraPoints }}</span>
              </template>
            </i18n-t>
            <br />
            <b-button
              v-t="'Envoyer une photo de tranche'"
              variant="info"
              href="https://edgecreator.ducksmanager.net"
              target="_blank"
            ></b-button>
          </div>
        </div>
      </div>
    </template>
  </Popover>
</template>

<script setup lang="ts">
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
const points = $computed(
  () => (user && users().points?.[user.id][contribution]) || null
);
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
