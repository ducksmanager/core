export {
  createCachedCoaApi,
  createCachedUserApi,
  getCommonCacheOptions,
} from "./src/api";
import StarRating from "./src/components/StarRating.vue";
import { bookcase } from "./src/stores/bookcase";
import { coa } from "./src/stores/coa";
import { collection } from "./src/stores/collection";
import { stats } from "./src/stores/stats";
export const stores = {
  coa,
  collection,
  bookcase,
  stats,
};

export const components = {
  StarRating,
};

export { default as i18n } from "./src/i18n";
