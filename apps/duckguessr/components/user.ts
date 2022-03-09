function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};expires=Session;path=/`
}

const getCookies = (): { [p: string]: string } =>
  document.cookie.split(';').reduce(
    (acc, cookie) => ({
      ...acc,
      [cookie.split('=')[0].replace(/^ /, '')]: cookie.split('=')[1],
    }),
    {}
  )

export const setUserCookieIfNotExists = () => {
  const cookies = getCookies()
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

export const getDuckguessrId = () => parseInt(getCookies()['duckguessr-id'])

export const setDuckguessrId = (id: number) => {
  setCookie('duckguessr-id', `${id}`)
}

export default () => {}
