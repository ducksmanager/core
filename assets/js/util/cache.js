import localforage from 'localforage'
import {setupCache} from 'axios-cache-adapter'

const now = new Date()
let inAMonth = now
inAMonth.setMonth(now.getMonth() + 1)
const isCoaUpdatePassedToday = now.getHours() > 4
const cacheExpiration = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + (isCoaUpdatePassedToday ? 1 : 0)}T04:00:00`)

const appCache = setupCache({
  maxAge: inAMonth,
  store: localforage
})

const coaCache = setupCache({
  maxAge: cacheExpiration - now,
  store: localforage
})

export {
  appCache,
  coaCache
}