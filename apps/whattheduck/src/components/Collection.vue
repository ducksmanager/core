<template>
  <ion-page>
    <ion-buttons v-if="componentName === IssueList" slot="end">
      <CopyListButton />
      <ViewModesButton v-if="!isIOS" />
    </ion-buttons>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title
          ><div class="content">
            <div class="title">
              <ion-button v-if="isCoaView" size="small" @click="backToCollection()">
                <ion-icon :md="arrowBackSharp" :ios="arrowBackOutline"></ion-icon>&nbsp;{{
                  $t('Retour à ma collection')
                }}
              </ion-button>
              <template v-else>
                <div>{{ $t('Ma collection') }}</div>
                <ion-chip v-if="total !== undefined" outline>{{ total }}</ion-chip></template
              >
              <ion-icon
                v-if="isOfflineMode"
                class="icon-offline ion-padding-start"
                :ios="cloudOfflineOutline"
                :md="cloudOfflineSharp"
                @click="showOfflineToast"
              />
            </div></div
        ></ion-title>
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
import { arrowBackOutline, arrowBackSharp, cloudOfflineOutline, cloudOfflineSharp } from 'ionicons/icons';

import FilterButton from './FilterButton.vue';
import OwnedIssueCopies from './OwnedIssueCopies.vue';

import { toastController } from '@ionic/vue';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';
import CountryList from '~/views/CountryList.vue';
import IssueList from '~/views/IssueList.vue';
import PublicationList from '~/views/PublicationList.vue';

const list = shallowRef<InstanceType<typeof CountryList | typeof PublicationList | typeof IssueList>>();

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
const { isOfflineMode } = storeToRefs(app());
const { t } = useI18n();
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

const showOfflineToast = async () => {
  const toast = await toastController.create({
    message: t(
      'Vous êtes en mode hors-ligne. Vous pouvez naviguer dans votre collection mais pas la modifier. Certaines fonctionnalités ne sont pas disponibles.',
    ),
    duration: 2000,
    cssClass: 'icon-offline',
    position: 'bottom',
  });

  await toast.present();
};

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
:deep(ion-content img) {
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

    ion-fab,
    ion-icon {
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

.icon-offline {
  color: var(--ion-color-warning);
}
</style>
