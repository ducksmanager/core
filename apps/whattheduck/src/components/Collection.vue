<template>
  <ion-page id="main-content">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-buttons slot="end">
          <ViewModesButton v-if="componentName === IssueList" />
        </ion-buttons>
        <ion-title
          ><div class="content">
            <div class="title">
              <div>{{ t('Ma collection') }}</div>
              <ion-chip outline v-if="total !== undefined">{{ total }}</ion-chip>
            </div>
          </div></ion-title
        >
      </ion-toolbar>
      <template v-if="hasItems">
        <Navigation />
        <ion-searchbar
          autocapitalize="sentences"
          v-if="componentName !== OwnedIssueCopies"
          v-model="filterText"
          placeholder="Filter"
      /></template>
    </ion-header>

    <component :is="componentName" @load="hasItems = $event" />
  </ion-page>
</template>

<script setup lang="ts" generic="Item extends Required<any>">
import OwnedIssueCopies from './OwnedIssueCopies.vue';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';
import CountryList from '~/views/CountryList.vue';
import IssueList from '~/views/IssueList.vue';
import PublicationList from '~/views/PublicationList.vue';

const { t } = useI18n();
const router = useRouter();

const { total } = storeToRefs(wtdcollection());
const { currentNavigationItem, filterText, navigationItemGroups } = storeToRefs(app());

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

watch(currentNavigationItem, async (newValue) => {
  if (newValue && /^[a-z]+\/[A-Z0-9]+ /.test(newValue)) {
    router.push('/edit-issues');
  }
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
