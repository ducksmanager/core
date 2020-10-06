import Vue from 'vue'
import Vuex from 'vuex'
import coa from "./modules/coa"

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        coa
    }
})