import Vue from 'vue'

export const state = () => ({
  countries: {},
  publications: {},
  issues: {},

  loadingUrls: [],
})

export const mutations = {
  setCountries(state, { locale, values }) {
    Vue.set(state.countries, locale, values)
  },
  setPublications(state, { countryCode, values }) {
    Vue.set(state.publications, countryCode, values)
  },
  setIssues(state, { publicationCode, values }) {
    Vue.set(state.issues, publicationCode, values)
  },
  addLoadingUrl(state, loadingUrl) {
    state.loadingUrls.push(loadingUrl)
  },
  removeLoadingUrl(state, loadingUrl) {
    state.loadingUrls.splice(state.loadingUrls.indexOf(loadingUrl), 1)
  },
}

export const actions = {
  async loadDataIfNotInCache(
    { state, commit },
    {
      parameterName,
      parameter,
      urlBase,
      stateKey,
      mutation,
      responseTransform = (response) => response,
    }
  ) {
    const url = `${urlBase}${parameter}`
    if (!state[stateKey][parameter] && !state.loadingUrls.includes(url)) {
      commit('addLoadingUrl', url)
      commit(mutation, {
        [parameterName]: parameter,
        values: responseTransform(await this.$axios.$get(url)),
      })
      commit('removeLoadingUrl', url)
    }
  },

  async loadCountries({ dispatch }) {
    await dispatch('loadDataIfNotInCache', {
      parameterName: 'locale',
      parameter: this.$i18n.locale,
      urlBase: '/api/coa/list/countries/',
      stateKey: 'countries',
      mutation: 'setCountries',
    })
  },
  async loadPublicationsByCountry({ dispatch }, countryCode) {
    await dispatch('loadDataIfNotInCache', {
      parameterName: 'countryCode',
      parameter: countryCode,
      urlBase: '/api/coa/list/publications/',
      stateKey: 'publications',
      mutation: 'setPublications',
    })
  },
  async loadIssues({ dispatch }, publicationCode) {
    await dispatch('loadDataIfNotInCache', {
      parameterName: 'publicationCode',
      parameter: publicationCode,
      urlBase: '/api/coa/list/issues/',
      stateKey: 'issues',
      mutation: 'setIssues',
      responseTransform: (response) => Object.values(response),
    })
  },
}
