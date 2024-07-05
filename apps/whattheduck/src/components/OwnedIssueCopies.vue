<template>
  <ion-content class="no-padding">
    <ion-row v-if="!isOfflineMode">
      <ion-col size="12"
        ><ion-img v-if="fullUrl" :src="coverUrl" />
        <ion-chip v-if="extraIssuenumbers.length">+&nbsp;{{ extraIssuenumbers.length - 1 }}</ion-chip></ion-col
      >
    </ion-row>
    <ion-row
      ><ion-col size="12">
        <ion-segment v-model="currentCopyIndex">
          <ion-segment-button v-for="(_, idx) in 3" :id="idx" :value="idx" v-show="copies[idx]">
            <template v-if="copies[idx]">
              <ion-label
                ><div>
                  {{ t('Ex. {index}', { index: idx + 1 }) }}
                </div>
                <Condition :value="copies[idx].condition"
              /></ion-label>
            </template>
          </ion-segment-button>
          <ion-button
            :style="{ gridColumn: 4 }"
            size="small"
            v-if="!isOfflineMode && copies.length <= 2"
            @click="addCopy"
          >
            <ion-icon :ios="addOutline" :android="addSharp" />&nbsp;{{ t('Ajouter un exemplaire') }}
          </ion-button> </ion-segment
        ><ion-button
          @click="
            copies.splice(currentCopyIndex!, 1);
            currentCopyIndex = currentCopyIndex! - 1 < 0 ? undefined : currentCopyIndex! - 1;
          "
          color="danger"
          size="small"
          v-if="currentCopyIndex !== undefined && !isOfflineMode"
          >{{ t('Retirer de la collection') }}</ion-button
        >
        <owned-issue-copy v-if="currentCopyIndex !== undefined" v-model="copies[currentCopyIndex]" />
      </ion-col>
    </ion-row>
    <div id="edit-issues-buttons" v-if="!isOfflineMode">
      <ion-fab>
        <ion-fab-button color="light" @click="currentNavigationItem = publicationcode!"
          ><ion-icon :ios="closeOutline" :md="closeSharp" /></ion-fab-button
      ></ion-fab>
      <ion-fab>
        <ion-fab-button color="success" @click="submitIssueCopies"
          ><ion-icon :ios="checkmarkOutline" :md="checkmarkSharp" /></ion-fab-button
      ></ion-fab>
    </div>
  </ion-content>
</template>

<script lang="ts" setup>
import { addOutline, addSharp, closeOutline, closeSharp, checkmarkOutline, checkmarkSharp } from 'ionicons/icons';
import type { SingleCopyState } from '~dm-types/CollectionUpdate';

import Condition from './Condition.vue';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { updateCollectionSingleIssue } = wtdcollection();
const { issuesByShortIssuecode } = storeToRefs(wtdcollection());
const { fetchCoverUrls } = coa();
const { isOfflineMode, currentNavigationItem, isCoaView, publicationcode, issuenumber, extraIssuenumbers } =
  storeToRefs(app());

const fullUrl = ref<string>();

watch(
  issuenumber,
  async () => {
    const covers = await fetchCoverUrls(publicationcode.value!);
    fullUrl.value = covers.covers[issuenumber.value!]?.fullUrl;
  },
  { immediate: true },
);

const { t } = useI18n();

const coverUrl = computed(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${fullUrl.value}`);

const shortIssuecode = computed(() => `${publicationcode.value} ${issuenumber.value}`);

const copies = ref<SingleCopyState[]>([]);

watch(
  issuesByShortIssuecode,
  () => {
    copies.value = issuesByShortIssuecode.value?.[shortIssuecode.value!] || [];
  },
  { immediate: true },
);

const currentCopyIndex = ref<number | undefined>(undefined);
watch(
  copies,
  () => {
    currentCopyIndex.value = copies.value.length ? 0 : undefined;
  },
  { immediate: true },
);

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
  await updateCollectionSingleIssue({
    publicationcode: publicationcode.value!,
    issuenumber: issuenumber.value!,
    copies: copies.value,
  });
  currentNavigationItem.value = publicationcode.value!;
  isCoaView.value = false;
};
</script>

<style scoped lang="scss">
ion-content > ion-row {
  &:first-child {
    height: 40%;
  }

  flex-wrap: nowrap;

  > ion-col {
    display: flex;
    align-items: center;
    &:first-child {
      justify-content: center;
    }

    &:last-child {
      flex-direction: column;
    }

    ion-img {
      max-height: 100%;
    }
  }
}
ion-segment {
  ion-label,
  ion-icon {
    margin: 0 !important;
  }

  :deep(.dm-condition-background) {
    margin-right: 0;
  }
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

#edit-issues-buttons {
  position: fixed;
  width: 100%;
  bottom: 1rem;
  display: flex;
  justify-content: center;
  z-index: 2;
  opacity: 0.7;

  ion-fab {
    position: static;
    margin: 0 0.5rem;
  }
}

ion-chip {
  position: absolute;
  background: rgba(127, 127, 127, 0.8);
}
</style>
