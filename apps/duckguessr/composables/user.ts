import { useCookies } from '@vueuse/integrations/useCookies'
import Index from '@prisma/client'
function setCookie(name: string, value: string) {
  useCookies().set(name, value, { expires: new Date(new Date().getTime() + 3600000), path: '/' })
}
export const removeCookie = (name: string) => {
  useCookies().remove(name)
}

export const setUserCookieIfNotExists = () => {
  const cookies = useCookies().getAll()
  if (!cookies['duckguessr-user']) {
    setCookie('duckguessr-user', `user${Math.random().toString().replace('0.', '')}`)
  }
}

export const isAnonymous = (username: string) => /^user\d+$/.test(username)

export const getDuckguessrId = () => parseInt(useCookies().getAll()['duckguessr-id'])

export const getDuckguessrUsername = () => useCookies().getAll()['duckguessr-user']

export const setDuckguessrUserData = ({ id, username }: Index.player) => {
  setCookie('duckguessr-id', `${id}`)
  setCookie('duckguessr-user', `${username}`)
}

export default () => {}
