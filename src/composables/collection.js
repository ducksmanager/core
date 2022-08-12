import { computed, onMounted } from 'vue'

import { user } from './global'
import { collection as collectionStore } from '~/stores/collection'
const { username } = user()

export const collection = () => {
  const userCollection = computed(() => collectionStore().collection)
  const purchases = computed(() => collectionStore().purchases)
  const totalPerPublication = computed(() => collectionStore().totalPerPublication)
  const loadCollection = collectionStore().loadCollection
  const load = async () => username && (await loadCollection())
  const findInCollection = (publicationCode, issueNumber) =>
    userCollection.value?.find(
      ({ country, magazine, issueNumber: collectionIssueNumber }) =>
        publicationCode === `${country}/${magazine}`
        && collectionIssueNumber === issueNumber,
    )

  onMounted(async () => await load())
  return {
    collection: userCollection,
    purchases,
    totalPerPublication,
    load,
    findInCollection,
  }
}
