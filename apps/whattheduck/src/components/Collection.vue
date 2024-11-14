<template>
  <ion-page id="main-content">
    <template #end>
      <ion-buttons v-if="componentName === IssueList">
        <CopyListButton />
        <ViewModesButton v-if="!isIOS" />
      </ion-buttons>
    </template>
    <ion-header :translucent="true">
      <ion-toolbar>
        <template #start>
          <ion-buttons>
            <ion-menu-button color="primary" />
          </ion-buttons>
        </template>
        <ion-title
          ><div class="content">
            <div class="title">
              <ion-button v-if="isCoaView" size="small" @click="backToCollection()">
                <ion-icon :md="arrowBackSharp" :ios="arrowBackOutline"></ion-icon>&nbsp;{{
                  t('Retour à ma collection')
                }}
              </ion-button>
              <template v-else>
                <div>{{ t('Ma collection') }}</div>
                <ion-chip v-if="total !== undefined" outline>{{ total }}</ion-chip></template
              >
            </div>
          </div></ion-title
        >
      </ion-toolbar>
      <Navigation v-if="!isCameraPreviewShown" />
      <template v-if="(list?.hasItems || filterText || currentFilter.id !== 'all') && !isCameraPreviewShown">
        <ion-searchbar v-model="filterText" inputmode="text" autocapitalize="sentences" placeholder="Filter" />
        <FilterButton v-if="filterText.length < 1 && !isCoaView && componentName === IssueList" />
      </template>
    </ion-header>

    <component :is="componentName" v-if="componentName === OwnedIssueCopies" />
    <component :is="componentName" v-else ref="list" />
  </ion-page>
</template>

<script setup lang="ts">
import { arrowBackOutline, arrowBackSharp } from 'ionicons/icons';

import FilterButton from './FilterButton.vue';
import OwnedIssueCopies from './OwnedIssueCopies.vue';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';
import CountryList from '~/views/CountryList.vue';
import IssueList from '~/views/IssueList.vue';
import PublicationList from '~/views/PublicationList.vue';

const { t } = useI18n();

const list = ref<InstanceType<typeof CountryList | typeof PublicationList | typeof IssueList> | null>(null);

const { total, ownedCountries, ownedPublications } = storeToRefs(wtdcollection());
const {
  filterText,
  isCoaView,
  isCameraPreviewShown,
  countrycode,
  publicationcode,
  issuecodes,
  currentNavigationItem,
  currentFilter,
  isIOS,
} = storeToRefs(app());

const { issuecodeDetails } = storeToRefs(coa());

const componentName = computed(() =>
  currentNavigationItem.value.type === 'all'
    ? CountryList
    : currentNavigationItem.value.type === 'countrycode'
      ? PublicationList
      : currentNavigationItem.value.type === 'publicationcode'
        ? IssueList
        : OwnedIssueCopies,
);

watch(componentName, () => {
  filterText.value = '';
});

const backToCollection = () => {
  isCoaView.value = false;
  if (issuecodes.value) {
    const issue = issuecodeDetails.value?.[issuecodes.value[0]];
    if (ownedPublications.value?.includes(publicationcode.value!)) {
      currentNavigationItem.value = { type: 'publicationcode', value: issue.publicationcode };
    } else {
      if (ownedCountries.value?.includes(countrycode.value!)) {
        currentNavigationItem.value = { type: 'countrycode', value: countrycode.value! };
      } else {
        currentNavigationItem.value = { type: 'all', value: 'all' };
      }
    }
  }
};
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
    top: 0.4rem;
    right: 0;
    height: 44px;

    ion-fab {
      position: relative;
      top: 0;
      right: 0;
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

ion-searchbar {
  ion-icon {
    display: none !important;
  }
}
</style>
