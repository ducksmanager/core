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
        <ion-col size="12" class="ion-justify-content-center" style="display: block">
          <ion-title class="ion-text-center" style="max-height: 20%">{{ t('Etats des numéros') }}</ion-title>
          <StatsComponent
            :link-to-collection-if-no-issue="false"
            :conditions="conditionsWithoutMissing"
            :number-per-condition="numberPerCondition"
        /></ion-col>
      </ion-row>
      <ion-row style="height: 25%">
        <ion-col size="12" class="ion-text-center ion-justify-content-center" style="flex-direction: column">
          <ion-title>{{ t('Valeur de la collection') }}</ion-title>
          <ion-text class="text-big">{{ wtdCollectionStore.quotationSum }}&euro;</ion-text>
          <template v-if="wtdCollectionStore.highestQuotedIssue">
            <ion-text>{{ t('Numéro le plus côté :') }}</ion-text>
            <ion-text>
              <Condition :value="getConditionText(wtdCollectionStore.highestQuotedIssue.condition)" />
              {{ coaStore.publicationNames[wtdCollectionStore.highestQuotedIssue.publicationcode] }}
              {{ wtdCollectionStore.highestQuotedIssue.issuenumber }}</ion-text
            ></template
          >
        </ion-col>
      </ion-row>
      <ion-row style="height: 50%" class="ion-text-center">
        <ion-title>{{ t('Progression de la collection') }}</ion-title>
        <ion-row style="height: initial">
          <ion-col v-for="{ title, value } of collectionProgressionGraphTypes">
            <ion-button
              expand="block"
              :fill="value === currentCollectionProgressionGraphType ? 'solid' : 'outline'"
              @click="currentCollectionProgressionGraphType = value"
              >{{ title }}</ion-button
            >
          </ion-col></ion-row
        >

        <ion-col size="12"> TODO </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { conditionsWithoutMissing } from '~/composables/useCondition';
import { wtdcollection } from '~/stores/wtdcollection';
import { components } from '~web';
import { coa } from '~web/src/stores/coa';
import { getConditionText } from '~/composables/useCondition';

const StatsComponent = components['Conditions'];
const { t } = useI18n();

type GraphType = 'pastYear' | 'allTime';
const currentCollectionProgressionGraphType = ref('pastYear' as GraphType);
const collectionProgressionGraphTypes: { title: string; value: GraphType }[] = [
  {
    title: t('Depuis 1 an'),
    value: 'pastYear',
  },
  {
    title: t('Depuis le début'),
    value: 'allTime',
  },
];

const wtdCollectionStore = wtdcollection();
const coaStore = coa();

const numberPerCondition = computed(() => wtdCollectionStore.numberPerCondition);
const highestQuotedIssue = computed(() => wtdCollectionStore.highestQuotedIssue);

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

  :deep(.wrapper) {
    height: 100% !important;
  }
}

ion-button {
  width: 100%;
}

.text-big {
  font-size: 10vh;
}
</style>
