import Vue from 'vue'
import Vuex from 'vuex'
import coa from "./modules/coa"
import l10n from "./modules/l10n";
import collection from "./modules/collection";

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        coa,
        collection,
        l10n
    }
})