import { defineStore } from 'pinia';
import type { NotEmptyStorageValue } from '~socket.io-client-services';
import type useDmSocket from '~web/src/composables/useDmSocket';

import usePersistedData from '~/composables/usePersistedData';

export const NAVIGATION_ITEM_REGEX =
  /^(?:$|(?<countrycode>[^/]+)(?:$|(?:\/(?<magazinecode>[^ ]+)(?:$|(?: +(?<issuenumber>.+))))))$/;

export const app = defineStore('app', () => {
  const innerTopMargin = ref(0);
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

  const issueViewModes = [
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

  const currentNavigationItem = ref<string>(route.hash.replace('#', ''));

  const navigationItemGroups = computed(
    () =>
      (NAVIGATION_ITEM_REGEX.exec(currentNavigationItem.value)?.groups || {}) as {
        countrycode?: string;
        magazinecode?: string;
        issuenumber?: string;
      },
  );

  watch(currentNavigationItem, async (code) => {
    if (route.name === 'Collection') {
      window.location.hash = code;
    } else {
      router.push({
        name: 'Collection',
        params: {
          type: route.params.type || 'coa',
        },
        hash: `#${code}`,
      });
    }
  });

  const countrycode = computed(() => navigationItemGroups.value.countrycode);
  const magazinecode = computed(() => navigationItemGroups.value.magazinecode);
  const publicationcode = computed(() =>
    navigationItemGroups.value.magazinecode
      ? `${navigationItemGroups.value.countrycode}/${navigationItemGroups.value.magazinecode}`
      : null,
  );
  const issuenumber = computed(() => navigationItemGroups.value.issuenumber);

  const copyListModes = [
    {
      id: 'owned',
      label: 'Copy owned issues',
      textPrefix: 'Owned issues -',
      showIfOffline: true,
      icon: { ios: '/icons/list.svg', md: '/icons/list.svg' },
      getTextToCopy: async () => collection().issueNumbersPerPublication[publicationcode.value!].join(', '),
    },
    {
      id: 'missing',
      label: 'Copy missing issues',
      textPrefix: 'Missing issues -',
      showIfOffline: false,
      icon: { ios: '/icons/edges.svg', md: '/icons/edges.svg' },
      getTextToCopy: async () => {
        await coa().fetchIssueNumbers([publicationcode.value!]);
        return coa()
          .issueNumbers[publicationcode.value!].filter(
            (issuenumber) => !collection().issueNumbersPerPublication[publicationcode.value!].includes(issuenumber),
          )
          .join(', ');
      },
    },
  ] as const;

  return {
    socket,
    filterText,
    isPersistedDataLoaded,
    socketCache,
    lastSync,
    currentNavigationItem,
    countrycode,
    magazinecode,
    publicationcode,
    issuenumber,
    navigationItemGroups,
    token,
    innerTopMargin,
    isOfflineMode,
    isCoaView: ref(route.query.coa === 'true'),
    isObsoleteSync: computed(
      () => !lastSync.value || new Date().getTime() - lastSync.value.getTime() > 12 * 60 * 60 * 1000,
    ),
    copyListModes,
    issueViewModes,
    currentIssueViewMode,
  };
});
