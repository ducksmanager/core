<template>
  <ion-page>
    <ion-header>
      <ion-title>{{ t('Numéro {issuenumber}', { issuenumber }) }}</ion-title>
    </ion-header>
    <ion-content>
      <ion-tabs>
        <ion-router-outlet />
        <ion-tab-bar slot="top">
          <ion-tab-button v-for="(_, idx) of copies" :tab="`copy-${idx}`" :href="`${issuePath}/copy/${idx}`">
            <ion-label>{{ t('Exemplaire {index}', { index: idx + 1 }) }}</ion-label> </ion-tab-button
          ><ion-tab-button v-if="copies.length <= 2" :tab="`copy-new`" :href="`${issuePath}/copy/new`">
            <ion-label>{{ t('Ajouter un exemplaire') }}</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { wtdcollection } from '~/stores/wtdcollection';

const collectionStore = wtdcollection();

const route = useRoute();

const { t } = useI18n();
const publicationcode = computed(() => `${route.params.countrycode}/${route.params.magazinecode}`);
const issuenumber = computed(() => route.params.issuenumber as string);
const issuecode = computed(() => `${publicationcode.value} ${issuenumber.value}`);
const issuePath = computed(() => route.path.replace(/\/copy\/.*/, ''));

const copies = computed(() => collectionStore.issuesByIssueCode?.[issuecode.value!] || []);
(async () => {
  await collectionStore.loadCollection();
})();
</script>
