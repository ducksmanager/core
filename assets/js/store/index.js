import Vue from 'vue'
import Vuex from 'vuex'
import coa from "./modules/coa"
import l10n from "./modules/l10n";
import collection from "./modules/collection";
import bookcase from "./modules/bookcase";
import users from "./modules/users";
import form from "./modules/form";

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        bookcase,
        coa,
        collection,
        form,
        l10n,
        users
    }
})