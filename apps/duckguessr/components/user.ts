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

export const getUser = () => {
  const cookies = getCookies()
  let username = cookies['dm-user'] || cookies['duckguessr-user']
  const password = cookies['dm-pass'] || null
  const duckguessrId: number | null =
    (cookies['duckguessr-id'] && parseInt(cookies['duckguessr-id'])) || null
  if (username) {
    return {
      duckguessrId,
      username,
      password,
      isAnonymous: /^user[0-9]+$/.test(username),
    }
  } else {
    username = `user${Math.random().toString().replace('0.', '')}`
    setCookie('duckguessr-user', username)
    return {
      duckguessrId,
      username,
      password: null,
      isAnonymous: true,
    }
  }
}

export const setDuckguessrId = (id: number) => {
  setCookie('duckguessr-id', `${id}`)
}

export default () => {}
