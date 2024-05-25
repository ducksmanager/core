<template>
  <ion-grid>
    <ion-row>
      <ion-col size="4" class="ion-padding">
        <ion-label>{{ t('Etat') }}</ion-label></ion-col
      >
      <ion-col size="8" class="ion-padding">
        <ion-row style="flex-direction: column" class="ion-align-items-end">
          <checkbox-group-with-radio-behavior
            :list="conditionsWithoutMissing"
            v-model:id="issue.condition"
            :getItemId="(item) => item.dbValue"
            :getCheckboxColor="(item) => item.themeColor"
          />
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
        ><ion-checkbox v-model="issue.isToRead" :aria-label="t('A lire')" /></ion-col
    ></ion-row>
    <ion-row>
      <ion-col size="4" class="ion-padding">
        <ion-label>{{ t("Date d'achat") }}</ion-label>

        <!-- TODO -->
        <!-- <ion-button style="visibility: hidden" size="small">{{ t("Créer une date d'achat") }}</ion-button> -->
      </ion-col>
      <ion-col size="8" class="ion-padding ion-text-right">
        <checkbox-group-with-radio-behavior
          v-if="purchasesIncludingNone"
          class="ion-text-right ion-padding-bottom vertical"
          label-placement="start"
          justify="end"
          v-model:id="issue.purchaseId"
          :list="purchasesIncludingNone"
          :getItemId="(item) => item.id"
        >
          <template #default="{ item }">
            <div
              :style="{ fontStyle: item.id === null ? 'italic' : 'normal' }"
              v-for="descriptionLine of item.dateAndDescription"
            >
              {{ descriptionLine }}
            </div></template
          ></checkbox-group-with-radio-behavior
        ></ion-col
      >
    </ion-row></ion-grid
  >
</template>
<script setup lang="ts">
import type { SingleCopyState } from '~dm-types/CollectionUpdate';
import { type purchase, type issue } from '~prisma-clients/client_dm';

import { wtdcollection } from '~/stores/wtdcollection';

const { t } = useI18n();
const issue = defineModel<SingleCopyState>({
  required: true,
});

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
ion-radio-group {
  display: flex;

  &.vertical {
    flex-direction: column;
  }
}
</style>
