<template>
  <ion-item>
    <ion-label>{{ t('Etat') }}</ion-label>

    <ion-radio-group v-if="selectedCondition" :model-value="selectedCondition">
      <ion-radio
        v-for="condition of conditions"
        :key="condition"
        :class="`dm-condition-background ${condition}`"
        :value="condition"
        :aria-label="t(`condition_${condition}`)"
      />
    </ion-radio-group>
  </ion-item>
  <ion-item>
    <ion-label>{{ t('A lire') }}</ion-label>
    <ion-checkbox slot="end" v-model="issue.isToRead" :aria-label="t('A lire')" /> </ion-item
  ><ion-item>
    <ion-label>{{ t("Date d'achat") }}</ion-label>
    <ion-list>
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
      </ion-radio-group>
    </ion-list>
  </ion-item>
</template>
<script setup lang="ts">
import type { purchase } from '~prisma-clients/client_dm';

import { condition } from '~/stores/condition';
import { wtdcollection } from '~/stores/wtdcollection';

const { t } = useI18n();
const route = useRoute();

const conditionStore = condition();
const collectionStore = wtdcollection();

const purchases = computed(() => collectionStore.purchases);
const conditions = computed(() => ['missing', ...Object.values(conditionStore.conditionL10n.map(({ en }) => en))]);

const publicationcode = computed(() => `${route.params.countrycode}/${route.params.magazinecode}`);
const issuecode = computed(() => `${publicationcode.value} ${route.params.issuenumber}`);
const copyIndex = computed(() => parseInt(route.params.copyIndex as string) as number);
const issue = computed(
  () =>
    collectionStore.issuesByIssueCode?.[issuecode.value!]?.[copyIndex.value!] || {
      purchaseId: null,
      isToRead: false,
    },
);

const selectedCondition = ref(null as string | null);
const selectedPurchase = ref(null as purchase | null);

watch(
  () => issue.value && collectionStore.purchases?.length,
  (isReady) => {
    if (isReady) {
      const thisPurchase = collectionStore.purchases?.find(({ id }) => id === issue.value.purchaseId) || null;
      if (thisPurchase) {
        selectedPurchase.value = thisPurchase;
      }
      const newCondition = 'condition' in issue.value && issue.value.condition;
      selectedCondition.value = newCondition
        ? conditionStore.conditionL10n.find(({ fr }) => fr === newCondition)?.en || 'none'
        : 'none';
    }
  },
  { immediate: true },
);

collectionStore.loadCollection();
collectionStore.loadPurchases();
</script>

<style scoped lang="scss">
ion-radio::part(container) {
  width: 30px;
  height: 30px;

  border-radius: 16px;
  border: 2px solid #ddd;
}

ion-radio {
  &::part(mark) {
    width: 100%;
    height: 100%;
  }
}

ion-radio-group {
  display: flex;

  &.vertical {
    flex-direction: column;
  }
}
</style>
