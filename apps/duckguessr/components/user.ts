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

export default () => {
  const cookies = getCookies()
  let username = cookies['dm-user'] || cookies['duckguessr-user']
  const password = cookies['dm-pass'] || null
  if (username) {
    return {
      username,
      password,
      isAnonymous: true,
    }
  } else {
    username = `user${Math.random().toString().replace('0.', '')}`
    setCookie('duckguessr-user', username)
    return {
      username,
      password: null,
      isAnonymous: false,
    }
  }
}
