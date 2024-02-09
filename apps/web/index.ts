import MedalImage from "./src/components/MedalImage.vue";
import StarRating from "./src/components/StarRating.vue";
import Conditions from "./src/components/stats/ConditionsComponent.vue";
import useCollection from "./src/composables/useCollection";
import {
  authServices,
  coaServices,
  coverIdServices,
  statsServices,
} from "./src/composables/useDmSocket";
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
  MedalImage,
  StarRating,
  Conditions,
};

export const composables = {
  useCollection,
  useMedal,
  useDmSocket: {
    coaServices,
    coverIdServices,
    authServices,
    statsServices,
  },
};

export { default as i18n } from "./src/i18n";
