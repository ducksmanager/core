import { CameraPreview } from '@capgo/camera-preview';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { toastController } from '@ionic/vue';
import type { SuccessfulEventOutput } from 'socket-call-client';
import type { Router } from 'vue-router';
import type { ClientEvents as CoverIdServices } from '~dm-services/cover-id';
import { app } from '~/stores/app';

const SEARCH_TIMEOUT_MS = 4000;

type Origin = 'pickCoverFile' | 'takePhoto';

export type Cover = SuccessfulEventOutput<CoverIdServices, 'searchFromCover'>['covers'][number];

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), ms);
    }),
  ]).finally(() => clearTimeout(timer));
};

const toErrorOutcome = (e: unknown) => {
  if (e && typeof e === 'object' && 'error' in e) {
    const { error, errorDetails, retryAfterMs } = e as {
      error: string;
      errorDetails?: string;
      retryAfterMs?: number;
    };
    return { status: 'error' as const, error, details: errorDetails, retryAfterMs };
  }
  return { status: 'error' as const, error: e instanceof Error ? e.message : 'Error' };
};

export const normalizeBase64 = (input: string): string =>
  input.startsWith('data:') ? input : `data:image/jpeg;base64,${input}`;

/** The file picker rejects with "pickFiles canceled." when the user dismisses it, which is not an error. */
const isPickerCancellation = (e: unknown): boolean =>
  e instanceof Error && e.message.toLowerCase().includes('canceled');

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target!.result!.toString());
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the picked file'));
    reader.readAsDataURL(blob);
  });

export default (router: Router, coverIdEvents: ReturnType<typeof useDmSocket>['coverId']) => {
  type SearchOutcome =
    | { status: 'match'; covers: Cover[] }
    | { status: 'no-match' }
    | { status: 'error'; error: string; details?: string };

  const isSearching = ref(false);
  const { t } = useI18n();

  const searchOneFrame = async (dataUrl: string, pastecIndex: number) => {
    try {
      const result = await withTimeout(coverIdEvents.searchFromCover(dataUrl, pastecIndex), SEARCH_TIMEOUT_MS);
      if ('error' in result) {
        return toErrorOutcome(result);
      }
      return result.covers.length
        ? { status: 'match' as const, covers: result.covers }
        : { status: 'no-match' as const };
    } catch (e) {
      return toErrorOutcome(e);
    }
  };

  const showToast = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 2000,
      cssClass: 'toast-error',
      positionAnchor: document.getElementById('overlay') ? 'overlay' : undefined,
      position: 'bottom',
      translucent: true,
    });

    await toast.present();
  };

  const handleOutcome = async (outcome: SearchOutcome, origin: Origin) => {
    if (outcome.status === 'match') {
      if (Capacitor.isNativePlatform()) {
        await CameraPreview.stop().catch(() => {});
      }
      app().isCameraPreviewShown = false;
      await router.push({
        path: '/cover-search-results',
        query: { searchResults: JSON.stringify(outcome.covers), origin },
      });
      return;
    }

    await showToast(
      outcome.status === 'error'
        ? t('La recherche a échoué, veuillez réessayer.')
        : t('Aucun résultat pour votre photo, veuillez réessayer.'),
    );
  };

  const searchCoverFromBase64String = async (base64: string, origin: Origin) =>
    handleOutcome(await searchOneFrame(normalizeBase64(base64), app().isFastCoverSearchEnabled ? 1 : 0), origin);

  return {
    isSearching,
    searchOneFrame,

    pickCoverFile: async () => {
      if (isSearching.value) {
        return;
      }
      isSearching.value = true;
      try {
        const coverFile = await FilePicker.pickImages({ readData: true });
        if (!coverFile.files.length) {
          return;
        }
        const { data, blob } = coverFile.files[0];
        await searchCoverFromBase64String(data ?? (await readAsDataUrl(blob!)), 'pickCoverFile');
      } catch (e) {
        if (!isPickerCancellation(e)) {
          await handleOutcome(toErrorOutcome(e), 'pickCoverFile');
        }
      } finally {
        isSearching.value = false;
      }
    },

    takePhoto: async () => {
      if (isSearching.value) {
        return;
      }
      isSearching.value = true;
      try {
        const { value: photoBase64 } = await CameraPreview.captureSample({ quality: 50 });
        await searchCoverFromBase64String(photoBase64, 'takePhoto');
      } catch (e) {
        await handleOutcome(toErrorOutcome(e), 'takePhoto');
      } finally {
        isSearching.value = false;
      }
    },
  };
};
