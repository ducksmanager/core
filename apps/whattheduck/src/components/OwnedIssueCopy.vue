<template>
  <ion-grid>
    <ion-row>
      <ion-col size="4" class="ion-padding">
        <ion-label>{{ $t('Etat') }}</ion-label></ion-col
      >
      <ion-col size="8" class="ion-padding">
        <ion-row style="flex-direction: column" class="ion-align-items-end">
          <ion-radio-group id="state-radio-group" v-model="issue.condition" style="display: flex; justify-content: end">
            <ion-radio
              v-for="item of conditionsWithoutMissing"
              :key="item.dbValue"
              label-placement="start"
              justify="end"
              :disabled="isOffline"
              :color="item.themeColor"
              :value="item.dbValue"
              class="ion-text-right ion-padding-bottom"
            />
          </ion-radio-group>
          <ion-label>{{
            conditionsWithoutMissing.find(({ dbValue }) => dbValue === issue.condition)?.getLabel()
          }}</ion-label></ion-row
        ></ion-col
      >
    </ion-row>
    <ion-row>
      <ion-col size="4" class="ion-padding">
        <ion-label>{{ $t('A lire') }}</ion-label></ion-col
      >
      <ion-col size="8" style="display: flex" class="ion-padding ion-justify-content-end"
        ><ion-checkbox v-model="issue.isToRead" :disabled="isOffline" :aria-label="$t('A lire')" /></ion-col
    ></ion-row>
    <ion-row class="ion-align-items-start">
      <ion-col size="4" class="ion-padding ion-text-left">
        <ion-label>{{ $t("Date d'achat") }}</ion-label>
      </ion-col>
      <ion-col size="8" class="ion-padding ion-text-right">
        <ion-button id="create-purchase-date" size="small">{{ $t("Créer une date d'achat") }}</ion-button>

        <ion-modal id="create-purchase-modal" ref="modal" trigger="create-purchase-date">
          <div class="wrapper">
            <h1>{{ $t("Créer une date d'achat") }}</h1>
            <ion-row>
              <ion-col size="6"> <ion-input v-model="newPurchase.date" type="date" /> </ion-col
              ><ion-col size="6">
                <ion-input
                  v-model="newPurchase.description"
                  type="text"
                  :maxlength="50"
                  :placeholder="$t('Description')"
                /> </ion-col
            ></ion-row>
            <ion-row>
              <ion-col size="12">
                <ion-button @click="createPurchaseDate">
                  {{ $t('Créer') }}
                </ion-button>
              </ion-col>
            </ion-row>
          </div>
        </ion-modal>

        <ion-radio-group v-if="purchasesIncludingNone" v-model="issue.purchaseId" class="vertical">
          <ion-row
            v-for="item of purchasesIncludingNone"
            :key="item.id || 'none'"
            class="ion-align-items-center ion-padding-bottom"
            ><ion-col size="1" style="min-width: 3rem" class="ion-align-items-start">
              <div v-if="item.id">
                <ion-button :id="`delete-purchase-${item.id}`" color="danger" size="small">
                  <ion-icon :ios="trashOutline" :md="trashSharp" />
                </ion-button>
                <ion-alert
                  :trigger="`delete-purchase-${item.id}`"
                  :header="$t('Supprimer la date d\'achat')"
                  :message="
                    $t(
                      'Voulez-vous vraiment supprimer cette date d\'achat ? Les numéros associés seront conservés mais n\'auront plus de date d\'achat.',
                    )
                  "
                  :buttons="[
                    {
                      text: $t('Supprimer'),
                      role: 'destructive',
                      handler: () => deletePurchase(item.id).then(() => loadPurchases(true)),
                    },
                    {
                      text: $t('Annuler'),
                    },
                  ]"
                ></ion-alert></div></ion-col
            ><ion-col>
              <ion-radio
                label-placement="start"
                justify="end"
                :disabled="isOffline"
                :value="item.id"
                class="ion-text-right"
              >
                <div
                  v-for="descriptionLine of item.dateAndDescription"
                  :key="descriptionLine"
                  :style="{ fontStyle: item.id === null ? 'italic' : 'normal' }"
                >
                  {{ descriptionLine }}
                </div>
              </ion-radio></ion-col
            ></ion-row
          >
        </ion-radio-group></ion-col
      >
    </ion-row></ion-grid
  >
</template>
<script setup lang="ts">
import type { SingleCopyState } from '~dm-types/CollectionUpdate';
import { type purchase } from '~prisma-schemas/schemas/dm';
import { trashOutline, trashSharp } from 'ionicons/icons';

import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const { t } = useI18n();
const issue = defineModel<SingleCopyState>({
  required: true,
});

const { isOffline } = storeToRefs(app());

const { conditionsWithoutMissing } = useCondition();
const { purchases } = storeToRefs(wtdcollection());
const { createPurchase, deletePurchase, loadPurchases } = wtdcollection();

const modal = ref();

const getCurrentDateFormatted = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, add 1 to get the correct month
  const day = String(date.getDate()).padStart(2, '0'); // Pad single digit days with a leading 0
  return `${year}-${month}-${day}`;
};

const newPurchase = ref({
  date: getCurrentDateFormatted(),
  description: '',
});

const dismissCreatePurchaseModal = () => modal.value!.$el.dismiss();

const createPurchaseDate = async () => {
  await createPurchase(newPurchase.value.date, newPurchase.value.description);
  dismissCreatePurchaseModal();
};

const purchasesIncludingNone = computed(() =>
  purchases.value
    ? [
        {
          id: null,
          dateAndDescription: [t("Pas de date d'achat")],
        },
        ...purchases.value.map(({ id, date, description }) => ({
          id,
          dateAndDescription: [date.toLocaleDateString(), description],
        })),
      ]
    : null,
);

const selectedPurchase = shallowRef<purchase>();

watch(
  issue,
  () => {
    if (issue.value) {
      const thisPurchase = purchases.value?.find(({ id }) => id === issue.value.purchaseId);
      if (thisPurchase) {
        selectedPurchase.value = thisPurchase;
      }
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
ion-grid {
  width: 100%;
  overflow-y: auto;

  ion-col {
    display: flex;
    flex-direction: column;
    align-items: end;

    &:first-child + ion-col:last-child {
      align-items: end;
    }

    // &:first-child:not(+ ion-col) {
    //   align-items: start;
    // }

    ion-radio-group {
      width: 100%;
      font-size: small;
      text-align: right;

      &.vertical {
        display: flex;
        flex-direction: column;
        padding: initial;
      }

      &:not(.vertical) {
        ion-radio {
          height: 20px;
        }
      }
    }
  }
}

#create-purchase-date {
  margin-top: 0;
  margin-bottom: 1rem;
}

ion-modal#create-purchase-modal {
  --width: fit-content;
  --min-width: 250px;
  --height: fit-content;
  --border-radius: 6px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);

  .wrapper {
    margin: 1rem;
  }
}

#state-radio-group:deep(.radio-group-wrapper) {
  display: flex;
  justify-content: end;
}
</style>
