<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Statistiques') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" v-if="wtdCollectionStore.collection">
      <ion-row style="height: 25%" class="ion-text-center">
        <ion-row class="ion-text-center" style="height: 75%">
          <ion-col size="4" class="text-big">{{ wtdCollectionStore.ownedCountries.length }}</ion-col
          ><ion-col size="4" class="text-big">{{ wtdCollectionStore.ownedPublications.length }}</ion-col
          ><ion-col size="4" class="text-big">{{ wtdCollectionStore.total }}</ion-col></ion-row
        >
        <ion-row class="ion-text-center" style="height: 25%">
          <ion-col size="4">{{ t('pays') }}</ion-col
          ><ion-col size="4">{{ t('magazines') }}</ion-col
          ><ion-col size="4"
            >{{ t('numéros') }}<br /><small>{{
              t('dont {copies} double|dont {copies} doubles', {
                copies: wtdCollectionStore.total! - wtdCollectionStore.totalUniqueIssues,
              })
            }}</small>
          </ion-col></ion-row
        >
      </ion-row>
      <ion-row style="height: 50%" class="ion-padding-vertical">
        <ion-col size="12" class="ion-justify-content-center">
          <ion-title class="ion-text-center">{{ t('Etats des numéros') }}</ion-title>
          <StatsComponent
            :link-to-collection-if-no-issue="false"
            :conditions="conditionsWithoutMissing"
            :number-per-condition="numberPerCondition"
        /></ion-col>
      </ion-row>
      <ion-row style="height: 25%">
        <ion-col size="12" class="ion-text-center ion-justify-content-center" style="flex-direction: column">
          <ion-title>{{ t('Valeur de la collection') }}</ion-title>
          <ion-text class="text-big">{{ wtdCollectionStore.quotationSum }}&euro;</ion-text></ion-col
        >
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { conditionsWithoutMissing } from '~/composables/useCondition';
import { wtdcollection } from '~/stores/wtdcollection';
import { components } from '~web';
import { coa } from '~web/src/stores/coa';
const StatsComponent = components['Conditions'];
const { t } = useI18n();

const wtdCollectionStore = wtdcollection();
const coaStore = coa();

const numberPerCondition = computed(() => wtdCollectionStore.numberPerCondition);

wtdCollectionStore.loadCollection().then(() => {
  coaStore.fetchIssueQuotations(wtdCollectionStore.ownedPublications);
});
</script>

<style lang="scss">
ion-row,
ion-col {
  width: 100%;
  height: 100%;
  display: flex;
}

ion-col {
  align-items: center;
  justify-content: center;
}

.text-big {
  font-size: 10vh;
}
</style>
