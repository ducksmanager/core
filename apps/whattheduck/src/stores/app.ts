import { Capacitor } from '@capacitor/core';
import { bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { defineStore } from 'pinia';

import usePersistedData from '~/composables/usePersistedData';
import type useDmSocket from '~web/src/composables/useDmSocket';

export interface FabOption {
  id: string;
  label: string;
  textPrefix?: string;
  icon?: { negate?: boolean; ios: string; md: string };
  showIfOffline?: boolean;
  getTextToCopy?: () => Promise<string>;
}

export const app = defineStore('app', () => {
  const offlineBannerHeight = ref(0);
  const socket = ref<ReturnType<typeof useDmSocket> | null>(null);

  const isOfflineMode = ref<boolean | 'offline_no_cache'>(false);
  const isOffline = computed(() => isOfflineMode.value !== false);
  const isIOS = computed(() => Capacitor.getPlatform() === 'ios');

  const { t } = useI18n();

  const router = useRouter();
  const route = useRoute();
  const token = ref<string | null>(); // undefined === we haven't checked whether there is a token ; null === we have checked and there is no token

  const isPersistedDataLoaded = ref(false);
  const filterText = ref('');
  const isCameraPreviewShown = ref(false);

  const isCoaView = ref(route.hash.startsWith('#coa-'));

  const currentNavigationItem = ref<
    | { type: 'all'; value: 'all' }
    | { type: 'countrycode' | 'publicationcode'; value: string }
    | { type: 'issuecodes'; value: string[] }
  >({ type: 'all', value: 'all' });

  watch(
    () => route.hash,
    (newValue) => {
      if (route.name !== 'Collection') {
        return;
      }
      const parts = newValue
        .replace(/^#(coa-)?/, '')
        .replaceAll('_', ' ')
        .split('=');
      if (parts.length === 1) {
        currentNavigationItem.value = { type: 'all', value: 'all' };
      } else {
        const [type, value] = parts as ['countrycode' | 'publicationcode' | 'issuecodes', string];
        if (type === 'issuecodes') {
          currentNavigationItem.value = {
            type,
            value: value.split(','),
          };
        } else {
          currentNavigationItem.value = {
            type,
            value,
          };
        }
      }
    },
    { immediate: true },
  );

  const countrycode = computed(() => {
    switch (currentNavigationItem.value?.type) {
      case 'countrycode':
        return currentNavigationItem.value.value;
      case 'publicationcode':
      case 'issuecodes':
        return publicationcode.value?.split('/')[0];
    }
    return null;
  });
  const publicationcode = computed(() => {
    switch (currentNavigationItem.value?.type) {
      case 'publicationcode':
        return currentNavigationItem.value.value;
      case 'issuecodes': {
        return coa().issuecodeDetails?.[issuecodes.value![0]]?.publicationcode;
      }
    }
  });
  const issuecodes = computed(() => {
    if (currentNavigationItem.value?.type === 'issuecodes') {
      return currentNavigationItem.value.value;
    }
  });

  const selectedIssuecodes = ref<string[] | null>(null);

  const issueViewModes: FabOption[] = [
    { id: 'list', label: 'List', icon: { ios: '/icons/list.svg', md: '/icons/list.svg' } },
    { id: 'edges', label: 'Edges', icon: { ios: '/icons/edges.svg', md: '/icons/edges.svg' } },
    {
      id: 'covers-small',
      label: 'Covers (small)',
      icon: { ios: '/icons/grid-sharp-small.svg', md: '/icons/grid-sharp-small.svg' },
    },
    {
      id: 'covers-medium',
      label: 'Covers (medium)',
      icon: { ios: '/icons/grid-sharp-medium.svg', md: '/icons/grid-sharp-medium.svg' },
    },
    {
      id: 'covers-large',
      label: 'Covers (large)',
      icon: { ios: '/icons/grid-sharp-large.svg', md: '/icons/grid-sharp-large.svg' },
    },
  ] as const;

  const currentIssueViewMode = ref<(typeof issueViewModes)[number]>(issueViewModes[0]);

  const filters: FabOption[] = [
    { id: 'all', label: 'All' },
    {
      id: 'unreadBooksOnly',
      label: t('Livres non-lus seulement'),
      icon: { ios: bookmarkOutline, md: bookmarkSharp },
    },
    {
      id: 'readBooksOnly',
      label: t('Livres lus seulement'),
      icon: { negate: true, ios: bookmarkOutline, md: bookmarkSharp },
    },
  ] as const;

  const currentFilter = ref<(typeof filters)[number]>(filters[0]);

  const copyListModes: FabOption[] = [
    {
      id: 'owned',
      label: 'Copy owned issues',
      textPrefix: 'Owned issues -',
      showIfOffline: true,
      // FIXME can't deconstruct collection() using storeToRefs
      getTextToCopy: async () =>
        collection()
          .issuecodesPerPublication[publicationcode.value!].map(({ issuenumber }) => issuenumber)
          .join(', '),
    },
    {
      id: 'missing',
      label: 'Copy missing issues',
      textPrefix: 'Missing issues -',
      showIfOffline: false,
      getTextToCopy: async () => {
        await coa().fetchIssuecodesByPublicationcode([publicationcode.value!]);
        return coa()
          .issuecodesByPublicationcode[publicationcode.value!].filter(
            // FIXME can't deconstruct collection() using storeToRefs
            (issuecode) =>
              !collection()
                .issuecodesPerPublication[publicationcode.value!].map(({ issuecode }) => issuecode)
                .includes(issuecode),
          )
          .map((issuecode) => coa().issuecodeDetails[issuecode].issuenumber)
          .join(', ');
      },
    },
  ] as const;

  console.log('token before usePersistedData', token.value);
  usePersistedData({
    token,
  }).then(() => {
    console.log({ token: token.value });
    if (!token.value) {
      token.value = null;
    }
    isPersistedDataLoaded.value = true;
  });

  watch(currentNavigationItem, async (navigationItem) => {
    selectedIssuecodes.value = null;
    const value = (
      Array.isArray(navigationItem?.value) ? navigationItem.value.join(',') : navigationItem?.value
    )?.replace(/ /g, '_');
    const hash = (isCoaView.value ? '#coa-' : '#') + (navigationItem?.type ? `${navigationItem?.type}=${value}` : '');
    if (route.name === 'Collection') {
      window.location.hash = hash;
    } else {
      await router.push({
        name: 'Collection',
        hash,
      });
    }
  });

  watch(isCoaView, (newValue) => {
    window.location.hash = newValue
      ? window.location.hash.replace(/^#/, '#coa-')
      : window.location.hash.replace(/^#coa-/, '#');
  });

  return {
    copyListModes,
    countrycode,
    currentFilter,
    currentIssueViewMode,
    currentNavigationItem,
    filters,
    filterText,
    isCameraPreviewShown,
    isCoaView,
    isIOS,
    isOffline,
    isOfflineMode,
    isPersistedDataLoaded,
    issuecodes,
    issueViewModes,
    offlineBannerHeight,
    publicationcode,
    selectedIssuecodes,
    socket,
    token,
  };
});
