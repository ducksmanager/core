import { defineStore } from 'pinia'

export const user = defineStore('user', {
  state: () => ({
    allUsers: null,
    username: null,
    userPhotographerPoints: null,
  }),

  actions: {
    async fetchAllUsers() {
      if (!this.allUsers) {
        this.allUsers = (
          await this.$nuxt.$axios.$get(`/api/ducksmanager/users`)
        ).users
      }
    },

    async fetchUserPoints() {
      const userIdData = await this.$nuxt.$axios.$get(`/user-id`)
      const userData = await this.$nuxt.$axios.$get(
        `/api/global-stats/user/${userIdData.id}`
      )
      this.userPhotographerPoints = userData.points.find(
        ({ contribution }) => contribution === 'Photographe'
      ).points_total
    },
  },
})
