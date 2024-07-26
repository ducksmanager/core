<template>
  <ion-content class="no-padding">
    <ion-row v-if="!isOfflineMode">
      <ion-col size="12" style="height: 100%"
        ><img v-if="fullUrl" :src="coverUrl" />
        <ion-chip v-if="extraShortIssuenumbers.length">+&nbsp;{{ extraShortIssuenumbers.length }}</ion-chip></ion-col
      >
    </ion-row>
    <ion-row
      ><ion-col size="12">
        <ion-segment v-if="!extraShortIssuenumbers.length" v-model="currentCopyIndex">
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
            <ion-icon :ios="addOutline" :md="addSharp" />&nbsp;{{ t('Ajouter un exemplaire') }}
          </ion-button> </ion-segment
        ><ion-button
          @click="
            copies.splice(currentCopyIndex!, 1);
            currentCopyIndex = currentCopyIndex! - 1 < 0 ? undefined : currentCopyIndex! - 1;
          "
          color="danger"
          size="small"
          v-if="currentCopyIndex !== undefined && !isOfflineMode"
          ><template v-if="extraShortIssuenumbers.length">{{
            t('Retirer ces {numberOfIssues} numéros de la collection', {
              numberOfIssues: extraShortIssuenumbers.length + 1,
            })
          }}</template>
          <template v-else>{{ t('Retirer de la collection') }}</template></ion-button
        >
        <owned-issue-copy v-if="currentCopyIndex !== undefined" v-model="copies[currentCopyIndex]" />
      </ion-col>
    </ion-row>
    <EditIssuesConfirmCancelButtons
      :confirm-ios="checkmarkOutline"
      :confirm-md="checkmarkSharp"
      :cancel-ios="closeOutline"
      :cancel-md="closeSharp"
      @cancel="currentNavigationItem = publicationcode!"
      confirm-color="success"
      @confirm="submitIssueCopies"
    />
  </ion-content>
</template>

<script lang="ts" setup>
import { addOutline, addSharp, checkmarkOutline, checkmarkSharp, closeOutline, closeSharp } from 'ionicons/icons';
import type { SingleCopyState } from '~dm-types/CollectionUpdate';

import Condition from './Condition.vue';
import EditIssuesConfirmCancelButtons from './EditIssuesConfirmCancelButtons.vue';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { updateCollectionSingleIssue, updateCollectionMultipleIssues } = wtdcollection();
const { issuesByShortIssuecode } = storeToRefs(wtdcollection());
const { fetchCoverUrlsByShortIssuecodes } = coa();
const { isOfflineMode, currentNavigationItem, isCoaView, publicationcode, shortIssuenumber, extraShortIssuenumbers } =
  storeToRefs(app());

const fullUrl = ref<string>();

const shortIssuecode = computed(() => `${publicationcode.value} ${shortIssuenumber.value}`);

watch(
  shortIssuenumber,
  async () => {
    const covers = await fetchCoverUrlsByShortIssuecodes([shortIssuecode.value]);
    fullUrl.value = covers.covers![shortIssuenumber.value!]?.fullUrl;
  },
  { immediate: true },
);

const { t } = useI18n();

const coverUrl = computed(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${fullUrl.value}`);

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
  if (extraShortIssuenumbers.value.length) {
    await updateCollectionMultipleIssues({
      publicationcode: publicationcode.value!,
      shortIssuenumbers: [shortIssuenumber.value!, ...extraShortIssuenumbers.value],
      ...copies.value[0],
    });
  } else {
    await updateCollectionSingleIssue({
      publicationcode: publicationcode.value!,
      shortIssuenumber: shortIssuenumber.value!,
      copies: copies.value,
    });
  }
  currentNavigationItem.value = publicationcode.value!;
  isCoaView.value = false;
};
</script>

<style scoped lang="scss">
ion-content > ion-row {
  &:first-child {
    height: 40%;
  }

  > ion-col {
    display: flex;
    align-items: center;
    &:first-child {
      justify-content: center;
    }

    &:last-child {
      flex-direction: column;
    }

    img {
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

ion-chip {
  position: absolute;
  background: rgba(127, 127, 127, 0.8);
}
</style>
