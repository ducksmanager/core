import { useCookies } from '@vueuse/integrations/useCookies'
function setCookie(name: string, value: string) {
  useCookies().set(name, value, { expires: new Date(new Date().getTime() + 3600000), path: '/' })
}
export const removeCookie = (name: string) => {
  useCookies().remove(name)
}

export const setUserCookieIfNotExists = () => {
  const cookies = useCookies().getAll()
  let username = cookies.PHPSESSID || cookies['duckguessr-user']
  const duckguessrId: number | null =
    (cookies['duckguessr-id'] && parseInt(cookies['duckguessr-id'])) || null
  if (username) {
    return {
      duckguessrId,
      username,
      isAnonymous: isAnonymous(username),
    }
  } else {
    username = `user${Math.random().toString().replace('0.', '')}`
    setCookie('duckguessr-user', username)
    return {
      duckguessrId,
      username,
      isAnonymous: true,
    }
  }
}

export const isAnonymous = (username: string) => /^user[0-9]+$/.test(username)

export const getDuckguessrId = () => parseInt(useCookies().getAll()['duckguessr-id'])

export const setDuckguessrId = (id: number) => {
  setCookie('duckguessr-id', `${id}`)
}

export default () => {}
