export {
  createCachedCoaApi,
  createCachedUserApi,
  getCommonCacheOptions,
} from "./src/api";
import { bookcase } from "./src/stores/bookcase";
import { coa } from "./src/stores/coa";
import { collection } from "./src/stores/collection";
export const stores = {
  coa,
  collection,
  bookcase,
};

export { default as i18n } from "./src/i18n";
