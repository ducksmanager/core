import Vue from 'vue'

export default {
  namespaced: true,
  state: () => ({
    loadedSprites: {}
  }),

  mutations: {
    addLoadedSprite(state, {spritePath, css}) {
      Vue.set(state.loadedSprites, spritePath, css)
    },
  }
}