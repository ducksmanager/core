import localforage from 'localforage'
import {setupCache} from 'axios-cache-adapter'

const now = new Date()
let inAnHour = new Date()
inAnHour.setHours(inAnHour.getHours() + 1)

let inAMonth = new Date()
inAMonth.setMonth(inAMonth.getMonth() + 1)

const isCoaUpdatePassedToday = now.getHours() > 4
const coaCacheExpiration = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate() + (isCoaUpdatePassedToday ? 1 : 0)}T04:00:00`)

const appCache = setupCache({
  maxAge: inAMonth,
  store: localforage,
  exclude: {
    query: false
  }
})

const userCountCache = setupCache({
  maxAge: inAnHour,
  store: localforage
})

const coaCache = setupCache({
  maxAge: coaCacheExpiration - now,
  store: localforage
})

export {
  appCache,
  userCountCache,
  coaCache
}