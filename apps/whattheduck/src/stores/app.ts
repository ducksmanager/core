import { bookmarkOutline } from 'ionicons/icons';
import { defineStore } from 'pinia';
import type { NotEmptyStorageValue } from '~socket.io-client-services';
import type useDmSocket from '~web/src/composables/useDmSocket';

import usePersistedData from '~/composables/usePersistedData';

export interface Option {
  id: string;
  label: string;
  textPrefix?: string;
  icon?: { color?: string; negate?: boolean; ios: string; md: string };
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
  const lastSync = ref<Date>();
  const token = ref<string | null>(); // undefined === we haven't checked whether there is a token ; null === we have checked and there is no token
  const socketCache = ref<Record<string, NotEmptyStorageValue>>({});
  const isPersistedDataLoaded = ref(false);
  const filterText = ref('');
  const isCameraPreviewShown = ref(false);

  const selectedIssuenumbers = ref<string[] | null>(null);

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
      icon: { color: 'green', ios: bookmarkOutline, md: bookmarkOutline },
    },
    {
      id: 'readBooksOnly',
      label: 'Read books only',
      icon: { color: 'green', negate: true, ios: bookmarkOutline, md: bookmarkOutline },
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

  type NavigationItem = null | { type: 'countrycode' | 'publicationcode' | 'issuecodes'; code: string };

  const currentNavigationItem = computed((): NavigationItem => {
    const parts = route.hash.replace('#', '').replaceAll('_', ' ').split('--');
    if (parts.length === 1) {
      return null;
    } else {
      const [type, code] = parts;
      return {
        type,
        code,
      } as NavigationItem;
    }
  });

  watch(currentNavigationItem, async (navigationItem: NavigationItem) => {
    selectedIssuenumbers.value = null;
    const codeWithoutSpaces = navigationItem ? `${navigationItem.type}--${navigationItem.code.replace(/ /g, '_')}` : '';
    if (route.name === 'Collection') {
      window.location.hash = codeWithoutSpaces;
    } else {
      await router.push({
        name: 'Collection',
        params: {
          type: route.params.type || 'coa',
        },
        hash: `#${codeWithoutSpaces}`,
      });
    }
  });

  const countrycode = computed(
    () => (currentNavigationItem.value?.type === 'countrycode' && currentNavigationItem.value.code) || null,
  );
  const publicationcode = computed(
    () => (currentNavigationItem.value?.type === 'publicationcode' && currentNavigationItem.value.code) || null,
  );
  const issuecode = computed(
    () =>
      (currentNavigationItem.value?.type === 'issuecodes' && currentNavigationItem.value?.code.split('/')[0]) || null,
  );
  const extraIssuecodes = computed(
    () =>
      (currentNavigationItem.value?.type === 'issuecodes' && currentNavigationItem.value?.code.split('/').slice(1)) ||
      null,
  );

  const allowMultipleSelection = computed(() => publicationcode.value !== undefined);

  return {
    socket,
    filterText,
    selectedIssuenumbers,
    allowMultipleSelection,
    isPersistedDataLoaded,
    isCameraPreviewShown,
    socketCache,
    lastSync,
    currentNavigationItem,
    countrycode,
    publicationcode,
    issuecode,
    extraIssuecodes,
    token,
    offlineBannerHeight,
    isOfflineMode,
    isCoaView: ref(route.query.coa === 'true'),
    isObsoleteSync: computed(
      () => !lastSync.value || new Date().getTime() - lastSync.value.getTime() > 12 * 60 * 60 * 1000,
    ),
    copyListModes,
    issueViewModes,
    currentIssueViewMode,
    filters,
    currentFilter,
  };
});
