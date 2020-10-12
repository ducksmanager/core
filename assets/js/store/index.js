import Vue from 'vue'
import Vuex from 'vuex'
import coa from "./modules/coa"
import l10n from "./modules/l10n";

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        coa,
        l10n
    }
})