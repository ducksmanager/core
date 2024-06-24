<template>
  <ion-button @click="emit('delete')" color="danger" size="small" v-if="!isOfflineMode">{{
    t('Supprimer cet exemplaire')
  }}</ion-button>
  <ion-grid>
    <ion-row>
      <ion-col size="4" class="ion-padding">
        <ion-label>{{ t('Etat') }}</ion-label></ion-col
      >
      <ion-col size="8" class="ion-padding">
        <ion-row style="flex-direction: column" class="ion-align-items-end">
          <ion-radio-group v-model="issue.condition">
            <ion-radio
              v-for="item of conditionsWithoutMissing"
              label-placement="start"
              justify="end"
              :disabled="isOfflineMode"
              :color="item.themeColor"
              :value="item.dbValue"
              class="ion-text-right ion-padding-bottom"
            />
          </ion-radio-group>
          <ion-label>{{
            conditionsWithoutMissing.find(({ dbValue }) => dbValue === issue.condition)?.label
          }}</ion-label></ion-row
        ></ion-col
      >
    </ion-row>
    <ion-row>
      <ion-col size="4" class="ion-padding">
        <ion-label>{{ t('A lire') }}</ion-label></ion-col
      >
      <ion-col size="8" style="display: flex" class="ion-padding ion-justify-content-end"
        ><ion-checkbox :disabled="isOfflineMode" v-model="issue.isToRead" :aria-label="t('A lire')" /></ion-col
    ></ion-row>
    <ion-row>
      <ion-col class="ion-padding-horizontal ion-text-left">
        <ion-label>{{ t("Date d'achat") }}</ion-label>
      </ion-col>
      <!-- <ion-col size="8" class="ion-padding">
        <ion-button style="visibility: hidden" size="small">{{ t("Créer une date d'achat") }}</ion-button>
      </ion-col> -->
    </ion-row>
    <ion-row>
      <!-- TODO -->
      <ion-col class="ion-padding-horizontal ion-text-right">
        <ion-radio-group v-model="issue.purchaseId" v-if="purchasesIncludingNone" class="vertical">
          <ion-radio
            v-for="item of purchasesIncludingNone"
            label-placement="start"
            justify="end"
            :disabled="isOfflineMode"
            :value="item.id"
            class="ion-text-right ion-padding-bottom"
          >
            <div
              :style="{ fontStyle: item.id === null ? 'italic' : 'normal' }"
              v-for="descriptionLine of item.dateAndDescription"
            >
              {{ descriptionLine }}
            </div>
          </ion-radio>
        </ion-radio-group></ion-col
      >
    </ion-row></ion-grid
  >
</template>
<script setup lang="ts">
import type { SingleCopyState } from '~dm-types/CollectionUpdate';
import { type purchase } from '~prisma-clients/extended/dm.extends';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { t } = useI18n();
const issue = defineModel<SingleCopyState>({
  required: true,
});

const emit = defineEmits<(event: 'delete') => void>();

const { isOfflineMode } = storeToRefs(app());

const { conditionsWithoutMissing } = useCondition();
const collectionStore = wtdcollection();

const purchasesIncludingNone = computed(() =>
  collectionStore.purchases
    ? [
        {
          id: null,
          dateAndDescription: [t("Pas de date d'achat")],
        },
        ...collectionStore.purchases.map(({ id, date, description }) => ({
          id,
          dateAndDescription: [date.toLocaleDateString(), description],
        })),
      ]
    : null,
);

const selectedPurchase = ref(null as purchase | null);

watch(
  issue,
  () => {
    if (issue.value) {
      const thisPurchase = collectionStore.purchases?.find(({ id }) => id === issue.value.purchaseId) || null;
      if (thisPurchase) {
        selectedPurchase.value = thisPurchase;
      }
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
ion-grid {
  width: 100%;
  overflow-y: auto;

  ion-col {
    display: flex;
    flex-direction: column;

    &:first-child + ion-col:last-child {
      align-items: end;
    }

    &:first-child:not(+ ion-col) {
      align-items: start;
    }

    ion-radio-group {
      width: 100%;
      font-size: small;
      &.vertical {
        display: flex;
        flex-direction: column;
        padding: initial;
      }

      &:not(.vertical) {
        ion-radio {
          padding: 0;
        }
      }
    }
  }
}
</style>
