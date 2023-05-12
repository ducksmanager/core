<template>
  <ion-page>
    <div id="container">
      <ion-item
        ><ion-label>{{ t('condition') }}</ion-label>

        <ion-radio-group v-if="selectedCondition" :model-value="selectedCondition">
          <ion-radio
            v-for="condition of conditions"
            :class="`dm-condition-background ${condition}`"
            :value="condition"
            :aria-label="t(`condition_${condition}`)"
          ></ion-radio></ion-radio-group
      ></ion-item>
      <ion-item>
        <ion-label>{{ t('in_to_read_list') }}</ion-label>
        <ion-checkbox
          slot="end"
          v-model="issue.inToReadList"
          :aria-label="t('in_to_read_list')"
        ></ion-checkbox> </ion-item
      ><ion-item>
        <ion-label>{{ t('purchase_date') }}</ion-label>
        <ion-list>
          <ion-button>{{ t('create_new_purchase_date') }}</ion-button>
          <ion-radio-group :model-value="issue.purchaseId" :value="issue.purchaseId" class="vertical">
            <ion-list>
              <ion-item>
                <ion-radio :value="null" :aria-label="t('no_purchase_date')"></ion-radio>
                <div><ion-label>fghfhf</ion-label></div></ion-item
              >
              <ion-item v-for="purchase of purchases">
                <ion-radio :value="purchase.id" :aria-label="purchase.description"></ion-radio>
                <div>
                  <ion-label>{{ purchase.date }}</ion-label>
                  <ion-label>{{ purchase.description }}</ion-label>
                </div></ion-item
              ></ion-list
            ></ion-radio-group
          >
        </ion-list>
      </ion-item>
    </div>
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonLabel, IonRadioGroup, IonRadio, IonItem, IonCheckbox, IonList } from '@ionic/vue';
import { watch } from 'vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { IssueWithPublicationcode, collection, purchaseWithStringDate } from '~/stores/collection';
import { condition } from '~/stores/condition';

const { t } = useI18n();
const route = useRoute();

const conditionStore = condition();
const collectionStore = collection();

const purchases = computed(() => collectionStore.purchases);
const conditions = computed(() => ['missing', ...Object.values(conditionStore.conditionL10n.map(({ en }) => en))]);

const publicationcode = computed(() => `${route.params.countrycode}/${route.params.magazinecode}`);
const issuecode = computed(() => `${publicationcode.value} ${route.params.issuenumber}`);
const copyIndex = computed(() => route.params.copyIndex as string);
const issue = computed(
  (): IssueWithPublicationcode =>
    collectionStore.issuesByIssueCode?.[issuecode.value!]?.[copyIndex.value!] || ({} as IssueWithPublicationcode)
);

const selectedCondition = ref(null as string | null);
const selectedPurchase = ref(null as purchaseWithStringDate | null);

watch(
  () => issue.value,
  (newIssue) => {
    selectedPurchase.value = newIssue?.purchase;
    const newCondition = newIssue?.condition;
    selectedCondition.value = newCondition
      ? conditionStore.conditionL10n.find(({ fr }) => fr === newCondition)?.en || 'none'
      : 'none';
  },
  { immediate: true }
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
