import {user} from "./global";
import {onMounted} from "vue";

const {collection: collectionStore} = require("../stores/collection");
const {username} = user()

export let collection = () => {
  const {collection: userCollection, purchases, totalPerPublication, loadCollection} = collectionStore()
  const load = async () => username && await loadCollection()
  const findInCollection = (publicationCode, issueNumber) =>
    userCollection && userCollection.find((
      {
        country,
        magazine,
        issueNumber: collectionIssueNumber
      }) => publicationCode === `${country}/${magazine}` && collectionIssueNumber === issueNumber)

  onMounted(async () => await load())
  return ({
    collection: userCollection,
    purchases,
    totalPerPublication,
    load,
    findInCollection
  });
};