export {
  createCachedCoaApi,
  createCachedUserApi,
  getCommonCacheOptions,
} from "./src/api";
import { bookcase } from "./src/stores/bookcase";
import { coa } from "./src/stores/coa";
export const stores = {
  coa,
  bookcase,
};

export { default as i18n } from "./src/i18n";
