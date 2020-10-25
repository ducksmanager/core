import Vue from 'vue'
import Vuex from 'vuex'
import coa from "./modules/coa"
import l10n from "./modules/l10n";
import collection from "./modules/collection";
import bookcase from "./modules/bookcase";
import users from "./modules/users";

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        coa,
        collection,
        l10n,
        bookcase,
        users
    }
})