<template>
  <ion-page id="main-content">
    <ion-buttons slot="end">
      <CopyListButton v-if="componentName === IssueList" />
      <ViewModesButton v-if="componentName === IssueList" />
    </ion-buttons>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title
          ><div class="content">
            <div class="title">
              <ion-button
                size="small"
                v-if="isCoaView"
                @click="
                  isCoaView = false;
                  if (issuenumber !== undefined) {
                    currentNavigationItem = publicationcode!;
                  }
                "
              >
                <ion-icon :md="arrowBackSharp" :ios="arrowBackOutline"></ion-icon>&nbsp;{{
                  t('Retour à ma collection')
                }}
              </ion-button>
              <template v-else>
                <div>{{ t('Ma collection') }}</div>
                <ion-chip outline v-if="total !== undefined">{{ total }}</ion-chip></template
              >
            </div>
          </div></ion-title
        >
      </ion-toolbar>
      <Navigation v-if="!isCameraPreviewShown" />
      <template v-if="hasItems && !isCameraPreviewShown">
        <ion-searchbar
          autocapitalize="sentences"
          v-if="componentName !== OwnedIssueCopies"
          v-model="filterText"
          placeholder="Filter"
      /></template>
    </ion-header>

    <component :is="componentName" @load="hasItems = $event as boolean" />
  </ion-page>
</template>

<script setup lang="ts">
import { arrowBackOutline, arrowBackSharp } from 'ionicons/icons';

import OwnedIssueCopies from './OwnedIssueCopies.vue';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';
import CountryList from '~/views/CountryList.vue';
import IssueList from '~/views/IssueList.vue';
import PublicationList from '~/views/PublicationList.vue';

const { t } = useI18n();

const { total } = storeToRefs(wtdcollection());
const {
  filterText,
  navigationItemGroups,
  isCoaView,
  isCameraPreviewShown,
  publicationcode,
  issuenumber,
  currentNavigationItem,
} = storeToRefs(app());

const hasItems = ref<boolean | undefined>();

const componentName = computed(() =>
  navigationItemGroups.value.issuenumber !== undefined
    ? OwnedIssueCopies
    : navigationItemGroups.value.magazinecode
      ? IssueList
      : navigationItemGroups.value.countrycode
        ? PublicationList
        : CountryList,
);

watch(componentName, () => {
  filterText.value = '';
});
</script>

<style scoped>
::v-deep(ion-content img) {
  margin-right: 1rem;
}
strong {
  font-size: 20px;
  line-height: 26px;
}

ion-buttons {
  &[slot='end'] {
    position: fixed;
    top: 0.2rem;
    right: 0;
    height: 44px;

    ion-fab {
      position: static;
    }
  }
}

p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

a {
  text-decoration: none;
}

ion-title {
  .title {
    display: flex !important;
    align-items: center;

    ion-chip {
      margin-left: 0.5rem;
    }
  }
}
</style>
