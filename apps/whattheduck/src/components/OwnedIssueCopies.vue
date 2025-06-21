<template>
  <ion-content class="no-padding">
    <ion-row v-if="!isOfflineMode && !isIOS">
      <ion-col size="12" style="height: 100%"
        ><img v-if="fullUrl" :src="coverUrl" /><ion-text v-else>{{ $t('pas de couverture') }}</ion-text>
        <ion-chip v-if="issuecodes.length > 1">+&nbsp;{{ issuecodes.length - 1 }}</ion-chip></ion-col
      >
    </ion-row>
    <ion-row
      ><ion-col size="12">
        <template v-if="issuecodes.length === 1">
          <ion-button v-if="!copies.length && !isOfflineMode" size="small" @click="addCopy">
            <ion-icon :ios="addOutline" :md="addSharp" />&nbsp;{{ $t('Ajouter un exemplaire') }}
          </ion-button>
          <ion-segment v-else v-model="currentCopyIndex">
            <ion-segment-button v-for="(_, idx) in 3" v-show="copies[idx]" :id="`copy-${idx}`" :key="idx" :value="idx">
              <template v-if="copies[idx]">
                <ion-label
                  ><div>
                    {{ $t('Ex. {index}', { index: idx + 1 }) }}
                  </div>
                  <Condition :value="copies[idx].condition"
                /></ion-label>
              </template>
            </ion-segment-button>
            <ion-button
              v-if="!isOfflineMode && copies.length <= 2"
              :style="{ gridColumn: 4 }"
              size="small"
              @click="addCopy"
            >
              <ion-icon :ios="addOutline" :md="addSharp" />&nbsp;{{ $t('Ajouter un exemplaire') }}
            </ion-button>
          </ion-segment></template
        ><ion-button
          v-if="currentCopyIndex !== undefined && !isOfflineMode"
          color="danger"
          size="small"
          @click="
            copies.splice(currentCopyIndex!, 1);
            currentCopyIndex = currentCopyIndex! - 1 < 0 ? undefined : currentCopyIndex! - 1;
          "
          ><template v-if="issuecodes.length > 1">{{
            $t('Retirer ces {numberOfIssues} numéros de la collection', { numberOfIssues: issuecodes.length })
          }}</template>
          <template v-else>{{ $t('Retirer de la collection') }}</template></ion-button
        >
        <owned-issue-copy v-if="currentCopyIndex !== undefined" v-model="copies[currentCopyIndex]" />
      </ion-col>
    </ion-row>
    <EditIssuesConfirmCancelButtons
      :confirm-ios="checkmarkOutline"
      :confirm-md="checkmarkSharp"
      :cancel-ios="closeOutline"
      :cancel-md="closeSharp"
      confirm-color="success"
      @cancel="router.go(-1)"
      @confirm="submitIssueCopies"
    />
  </ion-content>
</template>

<script lang="ts" setup>
import { addOutline, addSharp, checkmarkOutline, checkmarkSharp, closeOutline, closeSharp } from 'ionicons/icons';
import type { SingleCopyState } from '~dm-types/CollectionUpdate';

import Condition from './Condition.vue';
import EditIssuesConfirmCancelButtons from './EditIssuesConfirmCancelButtons.vue';

import router from '~/router';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { updateCollectionSingleIssue, updateCollectionMultipleIssues } = wtdcollection();
const { issuesByIssuecode } = storeToRefs(wtdcollection());
const { fetchCoverUrlsByIssuecodes, fetchIssuecodeDetails } = coa();
const { issuecodeDetails } = storeToRefs(coa());
const { isOfflineMode, isCoaView, currentNavigationItem, isIOS } = storeToRefs(app());

const fullUrl = ref<string | null>();

const issuecodes = computed(() => app().issuecodes!);

watch(
  issuecodes,
  async (newValue) => {
    if (newValue) {
      const newIssuecodes = [...newValue];
      await fetchIssuecodeDetails(newIssuecodes);
      const covers = await fetchCoverUrlsByIssuecodes(newIssuecodes);
      if (!('error' in covers)) {
        fullUrl.value = covers.covers![newIssuecodes[0]]?.fullUrl;
      }
    }
  },
  { immediate: true },
);

const coverUrl = computed(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${fullUrl.value}`);

const copies = ref<SingleCopyState[]>([]);

const currentCopyIndex = ref<number>();
watch(
  issuesByIssuecode,
  () => {
    copies.value = issuesByIssuecode.value?.[issuecodes.value![0]] || [];
    if (copies.value.length) {
      currentCopyIndex.value = 0;
    }
  },
  { immediate: true },
);

const addCopy = () => {
  copies.value = [
    ...copies.value,
    {
      id: null,
      condition: 'indefini',
      purchaseId: null,
      isToRead: false,
      isOnSale: false,
    },
  ];
};

const submitIssueCopies = async () => {
  if (issuecodes.value.length > 1) {
    await updateCollectionMultipleIssues({
      issuecodes: issuecodes.value,
      ...copies.value[0],
    });
  } else {
    await updateCollectionSingleIssue({
      issuecode: issuecodes.value[0],
      copies: copies.value,
    });
  }
  currentNavigationItem.value = {
    type: 'publicationcode',
    value: issuecodeDetails.value[issuecodes.value[0]].publicationcode,
  };
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
