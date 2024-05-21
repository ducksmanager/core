<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button color="medium" @click="cancel">{{ t('Annuler') }}</ion-button>
      </ion-buttons>
      <ion-title
        ><ion-row class="ion-align-items-center ion-justify-content-center"
          ><ion-col size="2"><ion-img :src="coverUrl" /></ion-col
          ><ion-col size="8"
            ><FullIssue
              :issue="{
                countrycode,
                publicationName,
                issuenumber,
              }" /></ion-col></ion-row
      ></ion-title>
      <ion-buttons slot="end">
        <ion-button @click="submitIssueCopies" :strong="true">{{ t('OK') }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-segment v-model="currentCopyIndex">
      <ion-segment-button v-for="(_, idx) of copies" :id="idx" :value="idx">
        <ion-label>{{ t('Exemplaire {index}', { index: idx + 1 }) }}</ion-label>
        <ion-icon
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
        />
      </ion-segment-button>
      <ion-button
        :style="{ gridColumn: copies.length ? 3 : 0 }"
        size="small"
        v-if="copies.length <= 2"
        @click="
          copies = [
            ...copies,
            {
              id: null,
              condition: 'indefini',
              purchaseId: null,
              isToRead: false,
              isOnSale: false,
            },
          ];
          currentCopyIndex = copies.length - 1;
        "
      >
        <ion-icon :ios="addOutline" :android="addSharp" />&nbsp;<template v-if="!copies.length">{{
          t('Ajouter un exemplaire')
        }}</template>
      </ion-button>
    </ion-segment>
    <owned-issue-copy v-if="currentCopyIndex !== undefined" v-model="copies[currentCopyIndex]" />
  </ion-content>
</template>

<script lang="ts" setup>
import { modalController } from '@ionic/vue';
import { addOutline, addSharp, closeOutline, closeSharp } from 'ionicons/icons';
import type { SingleCopyState } from '~dm-types/CollectionUpdate';

import FullIssue from '../components/FullIssue.vue';

import { wtdcollection } from '~/stores/wtdcollection';

const collectionStore = wtdcollection();
const coaStore = coa();

const props = defineProps<{
  publicationcode: string;
  issuenumber: string;
  fullUrl: string;
}>();
const { publicationcode, issuenumber, fullUrl } = toRefs(props);
const router = useRouter();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}>();

const { t } = useI18n();

const coverUrl = computed(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${fullUrl.value}`);

const countrycode = computed(() => publicationcode.value.split('/')[0]);
const issuecode = computed(() => `${publicationcode.value} ${issuenumber.value}`);

const publicationName = computed(() => coaStore.publicationNames[publicationcode.value]);
const copies = ref<SingleCopyState[]>(collectionStore.issuesByIssueCode?.[issuecode.value!] || []);

const currentCopyIndex = ref<number | undefined>(undefined);

const cancel = () => modalController.dismiss(null, 'cancel');
const submitIssueCopies = async () => {
  modalController.dismiss(null, 'confirm');
  emit('confirm');
  await collectionStore.updateCollectionSingleIssue({
    publicationcode: publicationcode.value,
    issuenumber: issuenumber.value,
    copies: copies.value,
  });
  router.push({
    name: 'IssueList',
    params: { type: 'collection', publicationcode: publicationcode.value },
  });
};
</script>

<style scoped lang="scss">
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
