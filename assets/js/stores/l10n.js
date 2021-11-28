import axios from "axios";
import { defineStore } from 'pinia'

import {appCache} from "../util/cache"

const appApi = axios.create({
  adapter: appCache.adapter,
})

export const l10n = defineStore('l10n', {
  state: () => ({
    isLoading: false,
    l10nRoutes: null
  }),

  actions: {
    async loadL10n() {
      if (!this.isLoading && !this.l10nRoutes) {
        this.isLoading = true
        this.l10nRoutes = (await appApi.get(`/routes?${localStorage.getItem('commit')}`)).data
        this.isLoading = false
      }
    }
  }
})
