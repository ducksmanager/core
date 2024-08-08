import { bookmarkSharp } from 'ionicons/icons';
import { defineStore } from 'pinia';
import type { NotEmptyStorageValue } from '~socket.io-client-services';
import type useDmSocket from '~web/src/composables/useDmSocket';

import usePersistedData from '~/composables/usePersistedData';

export interface Option {
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

  const isOfflineMode = ref(false);
  setTimeout(() => {
    setInterval(() => {
      isOfflineMode.value = (socket.value?.coa.socket || false) && !socket.value?.coa.socket.connected;
    }, 1000);
  }, 1000);

  const router = useRouter();
  const route = useRoute();
  const token = ref<string | null>(); // undefined === we haven't checked whether there is a token ; null === we have checked and there is no token
  const socketCache = ref<Record<string, NotEmptyStorageValue>>({});
  const isPersistedDataLoaded = ref(false);
  const filterText = ref('');
  const isCameraPreviewShown = ref(false);

  const currentNavigationItem = ref<
    null | { type: 'countrycode' | 'publicationcode'; value: string } | { type: 'issuecodes'; value: string[] }
  >(null);

  watch(
    () => route.hash,
    (newValue) => {
      const parts = newValue.replace('#', '').replaceAll('_', ' ').split('=');
      if (parts.length === 1) {
        currentNavigationItem.value = null;
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
        return publicationcode.value!.split('/')[0];
    }
    return null;
  });
  const publicationcode = computed(() => {
    switch (currentNavigationItem.value?.type) {
      case 'publicationcode':
        return currentNavigationItem.value.value;
      case 'issuecodes': {
        const issuecodeDetail = coa().issuecodeDetails?.[issuecodes.value![0]!];
        return issuecodeDetail.publicationcode;
      }
    }
  });
  const issuecodes = computed(() => {
    if (currentNavigationItem.value?.type === 'issuecodes') {
      return currentNavigationItem.value.value;
    }
  });

  const selectedIssuecodes = ref<string[] | null>(null);

  const issueViewModes: Option[] = [
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

  const filters: Option[] = [
    { id: 'all', label: 'All' },
    {
      id: 'unreadBooksOnly',
      label: 'Unread books only',
      icon: { ios: bookmarkSharp, md: bookmarkSharp },
    },
    {
      id: 'readBooksOnly',
      label: 'Read books only',
      icon: { negate: true, ios: bookmarkSharp, md: bookmarkSharp },
    },
  ] as const;

  const currentFilter = ref<(typeof filters)[number]>(filters[0]);

  const copyListModes: Option[] = [
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

  usePersistedData({
    token,
    socketCache,
  }).then(() => {
    console.log('token: ', JSON.stringify({ token: token.value }));
    if (!token.value) {
      token.value = null;
    }
    isPersistedDataLoaded.value = true;
  });

  watch(
    () => route.hash,
    (newValue) => {
      console.log('route.hash: ', JSON.stringify({ newValue }));
    },
  );

  watch(currentNavigationItem, async (navigationItem) => {
    selectedIssuecodes.value = null;
    const value = (
      Array.isArray(navigationItem?.value) ? navigationItem.value.join(',') : navigationItem?.value
    )?.replace(/ /g, '_');
    const typeAndValue = navigationItem?.type ? `#${navigationItem?.type}=${value}` : '';
    if (route.name === 'Collection') {
      window.location.hash = typeAndValue;
    } else {
      await router.push({
        name: 'Collection',
        params: {
          type: route.params.type || 'coa',
        },
        hash: typeAndValue,
      });
    }
  });

  return {
    socket,
    filterText,
    selectedIssuecodes,
    isPersistedDataLoaded,
    isCameraPreviewShown,
    socketCache,
    currentNavigationItem,
    countrycode,
    publicationcode,
    issuecodes,
    token,
    offlineBannerHeight,
    isOfflineMode,
    isCoaView: ref(route.query.coa === 'true'),
    copyListModes,
    issueViewModes,
    currentIssueViewMode,
    filters,
    currentFilter,
  };
});
