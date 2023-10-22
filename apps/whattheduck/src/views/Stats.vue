<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Stats') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <StatsComponent
        :link-to-collection-if-no-issue="false"
        :conditions="conditionsWithoutMissing"
        :number-per-condition="numberPerCondition"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { conditionsWithoutMissing } from '~/composables/useCondition';
import { wtdcollection } from '~/stores/wtdcollection';
import { components } from '~web';
const StatsComponent = components['Conditions'];
const { t } = useI18n();

const wtdCollectionStore = wtdcollection();

const numberPerCondition = computed(() => wtdCollectionStore.numberPerCondition);

wtdCollectionStore.loadCollection();
</script>
