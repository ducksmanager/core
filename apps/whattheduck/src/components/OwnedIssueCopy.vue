<template>
  <ion-page>
    <ion-item
      ><ion-label>{{ t('condition') }}</ion-label>

      <ion-radio-group slot="end" v-if="selectedCondition" :model-value="selectedCondition">
        <ion-radio
          v-for="condition of conditions"
          :class="`dm-condition-background ${condition}`"
          :value="condition"
          :aria-label="t(`condition_${condition}`)"
        ></ion-radio></ion-radio-group
    ></ion-item>
  </ion-page>
</template>
<script setup lang="ts">
import { IonPage, IonLabel, IonRadioGroup, IonRadio, IonItem } from '@ionic/vue';
import { watch } from 'vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { collection } from '~/stores/collection';
import { condition } from '~/stores/condition';

const { t } = useI18n();
const route = useRoute();

const conditionStore = condition();
const collectionStore = collection();
const conditions = computed(() => ['missing', ...Object.values(conditionStore.conditionL10n.map(({ en }) => en))]);
const issuecode = computed(() => route.params.issuecode as string);
const copyIndex = computed(() => route.params.copyIndex as string);
const issue = computed(() => collectionStore.issuesByIssueCode?.[issuecode.value!]?.[copyIndex.value!]);

const selectedCondition = ref(null as string | null);

watch(
  () => issue.value?.condition,
  (newCondition) => {
    selectedCondition.value = newCondition
      ? conditionStore.conditionL10n.find(({ fr }) => fr === newCondition)?.en || 'none'
      : 'none';
  },
  { immediate: true }
);

(async () => {
  await collectionStore.loadCollection();
})();
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
}
</style>
