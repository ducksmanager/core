<template>
  <ion-page id="main-content">
    <ion-buttons slot="end" v-if="componentName === IssueList">
      <CopyListButton />
      <ViewModesButton />
    </ion-buttons>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title
          ><div class="content">
            <div class="title">
              <ion-button size="small" v-if="isCoaView" @click="backToCollection()">
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
      <template v-if="list?.hasItems && !isCameraPreviewShown">
        <ion-searchbar inputmode="text" autocapitalize="sentences" v-model="filterText" placeholder="Filter" />
        <FilterButton v-if="filterText.length < 1" />
      </template>
    </ion-header>

    <component v-if="componentName === OwnedIssueCopies" :is="componentName" />
    <component v-else :is="componentName" ref="list" />
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
const { filterText, isCoaView, isCameraPreviewShown, countrycode, publicationcode, issuecodes, currentNavigationItem } =
  storeToRefs(app());

const { issuecodeDetails } = storeToRefs(coa());

const componentName = computed(() =>
  !currentNavigationItem.value
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
        currentNavigationItem.value = null;
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
