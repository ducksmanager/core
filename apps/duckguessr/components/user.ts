export default () => {
  const cookies: { [p: string]: string } = document.cookie.split(';').reduce(
    (acc, cookie) => ({
      ...acc,
      [cookie.split('=')[0].replace(/^ /, '')]: cookie.split('=')[1],
    }),
    {}
  )
  const username = cookies['dm-user']
  const password = cookies['dm-pass']
  if (username) {
    return {
      username,
      password,
    }
  } else
    return {
      username: undefined,
      password: undefined,
    }
}
