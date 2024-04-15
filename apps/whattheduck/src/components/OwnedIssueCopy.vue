<template>
  <ion-grid>
    <ion-row>
      <ion-col size="4">
        <ion-label>{{ t('Etat') }}</ion-label></ion-col
      >
      <ion-col size="8">
        <ion-row style="flex-direction: column" class="ion-align-items-center">
          <ion-radio-group :model-value="issue.condition">
            <ion-checkbox
              v-for="{ dbValue, label, themeColor } of conditionsWithoutMissing"
              :key="dbValue || 'missing'"
              :color="themeColor"
              :checked="issue.condition === dbValue"
              @ion-change="onChangeCondition($event, dbValue)"
              :aria-label="label"
            />
          </ion-radio-group>
          <ion-label>{{
            conditionsWithoutMissing.find(({ dbValue }) => dbValue === issue.condition)?.label
          }}</ion-label></ion-row
        ></ion-col
      >
    </ion-row>
    <ion-row>
      <ion-col size="4">
        <ion-label>{{ t('A lire') }}</ion-label></ion-col
      >
      <ion-col size="8" style="display: flex" class="ion-justify-content-center"
        ><ion-checkbox v-model="issue.isToRead" :aria-label="t('A lire')" /></ion-col
    ></ion-row>
    <ion-row>
      <ion-col size="4">
        <ion-label>{{ t("Date d'achat") }}</ion-label></ion-col
      >
      <ion-col size="8">
        <ion-button>{{ t("Créer une date d'achat") }}</ion-button>

        <ion-radio-group :model-value="issue.purchaseId" :value="issue.purchaseId" class="vertical">
          <ion-list>
            <ion-item>
              <ion-radio :value="null" :aria-label="t('Pas de date d\'achat')" />
              <div>
                <ion-label>{{ t("Pas de date d'achat") }}</ion-label>
              </div>
            </ion-item>
            <ion-item v-for="thisPurchase of purchases">
              <ion-radio :value="thisPurchase.id" :aria-label="thisPurchase.description" />
              <div>
                <ion-label>{{ thisPurchase.date }}</ion-label>
                <ion-label>{{ thisPurchase.description }}</ion-label>
              </div>
            </ion-item>
          </ion-list>
        </ion-radio-group></ion-col
      >
    </ion-row></ion-grid
  >
</template>
<script setup lang="ts">
import { type purchase, type issue, issue_condition } from '~prisma-clients/client_dm';

import { wtdcollection } from '~/stores/wtdcollection';
import { SingleCopyState } from '~dm-types/CollectionUpdate';

const { t } = useI18n();
const issue = defineModel<SingleCopyState>({
  required: true,
});

const { conditionsWithoutMissing } = useCondition();
const collectionStore = wtdcollection();

const purchases = computed(() => collectionStore.purchases);

const onChangeCondition = (event: Event & { detail: { checked: boolean } }, dbValue: issue_condition) => {
  if (event.detail.checked) {
    issue.value.condition = dbValue;
  } else {
    event.preventDefault();
  }
};

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
