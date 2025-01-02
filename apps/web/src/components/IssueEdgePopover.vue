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
                v-if="userPoints !== undefined && extraPoints !== null"
                contribution="edge_photographer"
                :user-level-points="userPoints"
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
const { extraPoints = null } = defineProps<{
  hasEdge: boolean;
  extraPoints: number | null;
}>();

const contribution = "edge_photographer";
const { isSharedBookcase } = storeToRefs(bookcase());
const { user } = storeToRefs(collection());
const { points } = storeToRefs(users());
const userPoints = $computed(
  () =>
    (user.value && points.value?.[user.value.id][contribution]) || undefined,
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
