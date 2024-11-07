import type { PageFlip } from "page-flip";

import Book from "./src/components/Book.vue";
import Bookcase from "./src/components/Bookcase.vue";
import InducksStory from "./src/components/InducksStory.vue";
import IssueQuotation from "./src/components/IssueQuotation.vue";
import MedalImage from "./src/components/MedalImage.vue";
import StarRating from "./src/components/StarRating.vue";
import Conditions from "./src/components/stats/ConditionsComponent.vue";
import useCollection from "./src/composables/useCollection";
import useDmSocket from "./src/composables/useDmSocket";
import useMedal from "./src/composables/useMedal";
import { bookcase } from "./src/stores/bookcase";
import { coa } from "./src/stores/coa";
import { collection } from "./src/stores/collection";
import { stats } from "./src/stores/stats";
import { users } from "./src/stores/users";
export const stores = {
  coa,
  collection,
  bookcase,
  stats,
  users,
};

export const components = {
  InducksStory,
  MedalImage,
  Book,
  Bookcase,
  StarRating,
  Conditions,
  IssueQuotation,
};

export const composables = {
  useCollection,
  useMedal,
  useDmSocket,
};

export { PageFlip };

export { default as i18n } from "./src/i18n";
