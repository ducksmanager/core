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
    <ion-content v-if="issues" :fullscreen="true">
      <ion-row style="height: 25vh" class="ion-text-center">
        <ion-row style="max-height: 120px">
          <ion-row class="ion-text-center" style="height: 75%">
            <ion-col size="4" class="text-big">{{ ownedCountries!.length }}</ion-col
            ><ion-col size="4" class="text-big">{{ ownedPublications!.length }}</ion-col
            ><ion-col size="4" class="text-big">{{ total }}</ion-col></ion-row
          >
          <ion-row class="ion-text-center" style="height: 25%">
            <ion-col size="4">{{ t('pays') }}</ion-col
            ><ion-col size="4">{{ t('publications') }}</ion-col
            ><ion-col size="4" style="flex-direction: column"
              ><div>{{ t('numéros') }}</div>
              <small>{{
                t('dont {copies} double|dont {copies} doubles', {
                  copies: total! - totalUniqueIssues,
                })
              }}</small>
            </ion-col></ion-row
          ></ion-row
        >
      </ion-row>
      <ion-row style="height: 50vh" class="ion-padding-vertical">
        <ion-col size="12" class="ion-justify-content-around" style="flex-direction: column">
          <ion-text style="height: 20%" class="text-medium">{{ t('Etats des numéros') }}</ion-text>
          <ConditionsComponent
            :style="{ width: '100%', height: '80%' }"
            :conditions="conditionsWithoutMissing"
            :number-per-condition="numberPerCondition"
        /></ion-col>
      </ion-row>
      <ion-row style="height: 25vh">
        <ion-row style="max-height: 120px">
          <ion-col size="12" class="ion-text-center ion-justify-content-around" style="flex-direction: column">
            <ion-text class="text-medium">{{ t('Valeur de la collection') }}</ion-text>
            <ion-text class="text-big">{{ quotationSum }}&euro;</ion-text>
            <template v-if="highestQuotedIssue">
              <ion-text>{{ t('Numéro le plus côté :') }}</ion-text>
              <ion-text>
                <Condition :value="highestQuotedIssue.condition" />
                {{ publicationNames[highestQuotedIssue.issuecode?.split(' ')[0]!] }}
                {{ issuecodeDetails[highestQuotedIssue.issuecode].issuenumber }}</ion-text
              ></template
            >
            <ion-text v-else>{{ t('Vous ne possédez pas de numéro côté.') }}</ion-text>
          </ion-col></ion-row
        >
      </ion-row>
      <ion-row style="height: calc(100vh - 50px)" class="ion-align-items-center">
        <ion-col size="12" class="ion-text-center ion-justify-content-around" style="flex-direction: column">
          <ion-text :style="{ height: '60px' }" class="text-medium">{{ t('Progression de la collection') }}</ion-text>
          <ion-row :style="{ height: '60px' }">
            <ion-col v-for="{ title, value } of collectionProgressionGraphTypes" :key="title">
              <ion-button
                expand="block"
                :fill="value === currentCollectionProgressionGraphType ? 'solid' : 'outline'"
                @click="currentCollectionProgressionGraphType = value"
                >{{ title }}</ion-button
              >
            </ion-col></ion-row
          >
          <PurchaseGraph :since="currentCollectionProgressionGraphType" :style="{ height: 'calc(100% - 140px)' }"
        /></ion-col>
      </ion-row> </ion-content
  ></ion-page>
</template>

<script setup lang="ts">
import { components } from '~web';
import { coa as webCoa } from '~web/src/stores/coa';

import { wtdcollection } from '~/stores/wtdcollection';

const { conditionsWithoutMissing } = useCondition();

const ConditionsComponent = components['Conditions'];
const { t } = useI18n();

type GraphType = 'pastYear' | 'allTime';
const currentCollectionProgressionGraphType = ref<GraphType>('pastYear');
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

const {
  numberPerCondition,
  highestQuotedIssue,
  ownedCountries,
  ownedPublications,
  issues,
  total,
  totalUniqueIssues,
  quotationSum,
} = storeToRefs(wtdcollection());
const { publicationNames, issuecodeDetails } = storeToRefs(webCoa());
const { loadUserIssueQuotations } = wtdcollection();

watch(
  ownedPublications,
  () => {
    if (ownedPublications.value) {
      loadUserIssueQuotations();
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
ion-row,
ion-col {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

ion-col {
  align-items: center;
  justify-content: center;

  :deep(.wrapper) {
    height: 100% !important;
  }
}

ion-title {
  padding-inline: 0;
}

ion-button {
  width: 100%;
}

.text-medium {
  font-size: 24px;
}

.text-big {
  font-size: 42px;
}
</style>
