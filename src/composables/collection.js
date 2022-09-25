import { computed, onMounted } from "vue";

import { collection as collectionStore } from "~/stores/collection";

const user = $computed(() => collection().user);

export const collection = () => {
  const userCollection = computed(() => collectionStore().collection);
  const purchases = computed(() => collectionStore().purchases);
  const totalPerPublication = computed(
    () => collectionStore().totalPerPublication
  );
  const loadCollection = collectionStore().loadCollection;
  const load = async () => user && (await loadCollection());
  const findInCollection = (publicationCode, issueNumber) =>
    userCollection.value?.find(
      ({ country, magazine, issueNumber: collectionIssueNumber }) =>
        publicationCode === `${country}/${magazine}` &&
        collectionIssueNumber === issueNumber
    );

  onMounted(async () => await load());
  return {
    collection: userCollection,
    purchases,
    totalPerPublication,
    load,
    findInCollection,
  };
};
