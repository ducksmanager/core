<template>
  <ion-content class="ion-padding">
    <ion-row>
      <ion-col v-if="!isOfflineMode" cols="4"><ion-img v-if="fullUrl" :src="coverUrl" /></ion-col>
      <ion-col :cols="isOfflineMode ? 12 : 8">
        <ion-segment v-model="currentCopyIndex">
          <ion-segment-button v-for="(_, idx) in 3" :id="idx" :value="idx">
            <template v-if="copies[idx]">
              <ion-label
                ><Condition :value="copies[idx].condition" />
                {{ t('Exemplaire {index}', { index: idx + 1 }) }}</ion-label
              >
              <ion-icon
                v-if="!isOfflineMode"
                :ios="closeOutline"
                :android="closeSharp"
                color="danger"
                size="small"
                style="pointer-events: all"
                class="delete no-padding"
                @click.stop.prevent="
                  copies.splice(idx, 1);
                  currentCopyIndex = idx - 1 < 0 ? undefined : idx - 1;
                "
            /></template>
          </ion-segment-button>
          <ion-button
            :style="{ gridColumn: copies.length + 1 }"
            size="small"
            v-if="!isOfflineMode && copies.length <= 2"
            @click="addCopy"
          >
            <ion-icon :ios="addOutline" :android="addSharp" />&nbsp;{{ t('Ajouter un exemplaire') }}
          </ion-button>
        </ion-segment>
        <owned-issue-copy v-if="currentCopyIndex !== undefined" v-model="copies[currentCopyIndex]" />
      </ion-col>
    </ion-row>
    <template v-if="!isOfflineMode">
      <ion-fab ref="fab" slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="submitIssueCopies"
          ><ion-icon :ios="checkmarkOutline" :md="checkmarkSharp" /></ion-fab-button></ion-fab
      ><ion-fab ref="fab" slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="currentNavigationItem = issuecode"
          ><ion-icon :ios="closeOutline" :md="closeSharp" /></ion-fab-button></ion-fab
    ></template>
  </ion-content>
</template>

<script lang="ts" setup>
import { modalController } from '@ionic/vue';
import { addOutline, addSharp, closeOutline, closeSharp, checkmarkOutline, checkmarkSharp } from 'ionicons/icons';
import type { SingleCopyState } from '~dm-types/CollectionUpdate';

import Condition from './Condition.vue';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const collectionStore = wtdcollection();
const coaStore = coa();
const { isOfflineMode, navigationItemGroups, currentNavigationItem, isCoaView } = storeToRefs(app());

const publicationcode = computed(
  () => `${navigationItemGroups.value.countrycode}/${navigationItemGroups.value.magazinecode}`,
);
const issuenumber = computed(() => `${navigationItemGroups.value.issuenumber}`);
const fullUrl = ref<string>();

watch(
  issuenumber,
  async () => {
    const covers = await coaStore.fetchCoverUrls(publicationcode.value);
    fullUrl.value = covers.covers[issuenumber.value]?.fullUrl;
  },
  { immediate: true },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}>();

const { t } = useI18n();

const coverUrl = computed(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${fullUrl.value}`);

const issuecode = computed(() => `${publicationcode.value} ${issuenumber.value}`);

const copies = ref<SingleCopyState[]>(collectionStore.issuesByIssueCode?.[issuecode.value!] || []);

const currentCopyIndex = ref<number | undefined>(copies.value.length ? 0 : undefined);

const addCopy = () => {
  copies.value.push({
    id: null,
    condition: 'indefini',
    purchaseId: null,
    isToRead: false,
    isOnSale: false,
  });
  nextTick().then(() => {
    currentCopyIndex.value = copies.value.length - 1;
  });
};

const submitIssueCopies = async () => {
  modalController.dismiss(null, 'confirm');
  emit('confirm');
  await collectionStore.updateCollectionSingleIssue({
    publicationcode: publicationcode.value,
    issuenumber: issuenumber.value,
    copies: copies.value,
  });
  currentNavigationItem.value = issuecode.value;
  isCoaView.value = false;
};
</script>

<style scoped lang="scss">
ion-segment {
  ion-label,
  ion-icon {
    margin: 0 !important;
  }
}

ion-img {
  height: 50px;
}
ion-button {
  grid-row: 1;
}

ion-icon.delete {
  position: absolute;
  left: -5px;
  height: calc(100% - 10px);
  width: 28px;
}
</style>
