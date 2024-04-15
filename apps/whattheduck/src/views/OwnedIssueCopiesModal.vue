<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button color="medium" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title
        ><ion-row class="ion-align-items-center"
          ><ion-col size="2"><ion-img :src="coverUrl" /></ion-col
          ><ion-col size="8">{{ publicationName }} {{ issuenumber }}</ion-col></ion-row
        ></ion-title
      >
      <ion-buttons slot="end">
        <ion-button @click="confirm" :strong="true">Confirm</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-segment :value="currentCopyIndex">
      <ion-segment-button v-for="(_, idx) of copies" :id="idx" :value="idx">
        <ion-label>{{ t('Exemplaire {index}', { index: idx + 1 }) }}</ion-label>
      </ion-segment-button>
      <ion-button
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
          ]
        "
      >
        <ion-label>{{ t('Ajouter un exemplaire') }}</ion-label>
      </ion-button>
    </ion-segment>
    <owned-issue-copy v-if="currentCopyIndex !== undefined" v-model="copies[currentCopyIndex]" />
  </ion-content>
</template>

<script lang="ts" setup>
import { wtdcollection } from '~/stores/wtdcollection';
import { modalController } from '@ionic/vue';
import { SingleCopyState } from '~dm-types/CollectionUpdate';

const collectionStore = wtdcollection();
const coaStore = coa();

const props = defineProps<{
  publicationcode: string;
  issuenumber: string;
  fullUrl: string;
}>();
const { publicationcode, issuenumber, fullUrl } = toRefs(props);

defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}>();

const { t } = useI18n();

const coverUrl = computed(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${fullUrl.value}`);

const issuecode = computed(() => `${publicationcode.value} ${issuenumber.value}`);

const publicationName = computed(() => coaStore.publicationNames[publicationcode.value]);
const copies = ref<SingleCopyState[]>(collectionStore.issuesByIssueCode?.[issuecode.value!] || []);

const currentCopyIndex = ref<number | undefined>(undefined);

const cancel = () => modalController.dismiss(null, 'cancel');
const confirm = () => modalController.dismiss('!', 'confirm');

watch(copies, () => {
  currentCopyIndex.value = copies.value.length - 1;
});
</script>

<style scoped lang="scss">
ion-img {
  height: 50px;
}
ion-button {
  grid-row: 1;
}
</style>
