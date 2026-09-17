<template>
  <div id="cover-suggestion" role="button" tabindex="0" @click="emit('confirm')" @keyup.enter="emit('confirm')">
    <ion-img :src="coverUrl" class="thumbnail" />
    <div class="details">
      <div class="title">{{ title ?? $t('Recherche du titre...') }}</div>
      <div class="hint">{{ $t('Appuyez pour voir le résultat') }}</div>
    </div>
    <ion-button fill="clear" color="medium" :aria-label="$t('Ignorer cette suggestion')" @click.stop="emit('dismiss')">
      <ion-icon :ios="closeOutline" :md="closeSharp" />
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { closeOutline, closeSharp } from 'ionicons/icons';
import { coa } from '~web/src/stores/coa';

import type { Cover } from '~/composables/useCoverSearch';

const { cover } = defineProps<{ cover: Cover }>();
const emit = defineEmits<{ confirm: []; dismiss: [] }>();

const { issuecodeDetails, publicationNames } = storeToRefs(coa());
const { fetchIssuecodeDetails, fetchPublicationNames } = coa();

const coverUrl = computed(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${cover.fullUrl}`);

const details = computed(() => issuecodeDetails.value[cover.issuecode]);
const title = computed(() => {
  const issue = details.value;
  if (!issue) {
    return undefined;
  }
  const publicationName = publicationNames.value[issue.publicationcode];
  return publicationName ? `${publicationName} ${issue.issuenumber}` : undefined;
});

// The thumbnail renders immediately; the text fills in once COA data arrives.
watch(
  () => cover.issuecode,
  async (issuecode) => {
    await fetchIssuecodeDetails([issuecode]);
    const publicationcode = issuecodeDetails.value[issuecode]?.publicationcode;
    if (publicationcode) {
      await fetchPublicationNames([publicationcode]);
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
#cover-suggestion {
  position: absolute;
  bottom: 5rem;
  left: 1rem;
  right: 1rem;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 12px;
  background: var(--dm-background-color);
  box-shadow: 0 4px 16px rgb(0 0 0 / 40%);
  cursor: pointer;

  .thumbnail {
    width: 3rem;
    flex: none;
  }

  .details {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  .title {
    font-weight: 600;
    line-height: 1.2;
    /* Publication names are long; two lines beats truncating to "Mickey Parade Geant Hors-S...". */
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .hint {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  ion-button {
    min-height: initial;
    flex: none;
  }
}
</style>
