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
import { MedalLevel, MedalLevelAndProgress } from '~/types/playerStats'

export const MEDAL_LEVELS: MedalLevel[] = [
  new MedalLevel('fast', [25, 150, 500]),
  new MedalLevel('ultra_fast', [10, 50, 200]),
  new MedalLevel('published-fr-recent', [10, 75, 300]),
]

export const userStore = defineStore('user', {
  state: () => ({
    loginSocket: null as Socket<ServerToClientEvents, ClientToServerEvents> | null,
    user: null as Index.player | null,
    stats: null as { [key: string]: number } | null,
    gameStats: null as { [key: string]: number } | null,
    attempts: 0 as number,
  }),
  getters: {
    isAnonymous: (state) => state.user && isAnonymousNative(state.user.username),

    levelsAndProgress: (state): { [key: string]: MedalLevelAndProgress } =>
      MEDAL_LEVELS.reduce((acc, { medalType, levels }) => {
        const level =
          ([...levels]!
            .reverse()
            .findIndex((levelThreshold: number) => state.stats![medalType] > levelThreshold) ||
            -1) + 1
        if (level === 3) {
          return {
            ...acc,
            [medalType]: new MedalLevelAndProgress(level, 100, 0, 100, 0),
          }
        }
        const currentLevelThreshold = level === 0 ? 0 : levels[level - 1]
        const nextLevelThreshold = levels[level]
        const totalPointsToReachNextLevel = nextLevelThreshold - currentLevelThreshold

        const currentLevelPoints = state.stats![medalType] - currentLevelThreshold
        const levelPercentage = (100 * currentLevelPoints) / totalPointsToReachNextLevel

        const currentLevelProgressPoints = state.gameStats ? state.gameStats![medalType] : 0
        const levelPercentageProgress = state.gameStats
          ? (100 * currentLevelProgressPoints) / totalPointsToReachNextLevel
          : 0
        return {
          ...acc,
          [medalType]: new MedalLevelAndProgress(
            level,
            currentLevelPoints,
            currentLevelProgressPoints,
            levelPercentage,
            levelPercentageProgress
          ),
        }
      }, {}),
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
          removeCookie('PHPSESSID')
          if (vm.attempts < 1) {
            vm.attempts++
            setUserCookieIfNotExists()
            vm.login()
          }
        })
    },

    loadStats() {
      const vm = this
      this.loginSocket!.emit('getStats', (stats: typeof vm.stats) => {
        vm.stats = stats
      })
    },

    loadGameStats(gameId: number, currentGameDatasetName: string | null, isWinningPlayer: boolean) {
      const vm = this
      this.loginSocket!.emit('getGameStats', gameId, (stats: typeof vm.gameStats) => {
        vm.gameStats = stats
        if (currentGameDatasetName) {
          vm.gameStats![currentGameDatasetName] = isWinningPlayer ? 1 : 0
        }
      })
    },
  },
})
