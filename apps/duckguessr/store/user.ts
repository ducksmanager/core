import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'
import { useCookies } from '@vueuse/integrations/useCookies'
import Index from '@prisma/client'
import {
  isAnonymous as isAnonymousNative,
  removeCookie,
  setDuckguessrUserData,
  setUserCookieIfNotExists,
} from '~/composables/user'
import { ClientToServerEvents, ServerToClientEvents } from '~/types/socketEvents'

export const userStore = defineStore('user', {
  state: () => ({
    loginSocket: null as Socket<ServerToClientEvents, ClientToServerEvents> | null,
    user: null as Index.player | null,
    attempts: 0 as number,
  }),
  getters: {
    isAnonymous: (state) => state.user && isAnonymousNative(state.user.username),
  },
  actions: {
    login() {
      const vm = this
      this.loginSocket = io(`${process.env.SOCKET_URL}/login`, {
        auth: {
          cookie: useCookies().getAll(),
        },
      })
        .on('logged', (loggedInUser: Index.player) => {
          vm.user = loggedInUser
          console.log(`logged as ${vm.user.username}`)
          setDuckguessrUserData(loggedInUser)
        })
        .on('loginFailed', () => {
          console.log('loginFailed')
          removeCookie('duckguessr-user')
          if (vm.attempts < 1) {
            vm.attempts++
            setUserCookieIfNotExists()
            vm.login()
          }
        })
    },
  },
})
