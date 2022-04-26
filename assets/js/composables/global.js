export function user() {
  return {
    userId: localStorage.getItem('userId') || undefined,
    username: localStorage.getItem('username') || undefined
  }
}

export function locale() {
  return localStorage.getItem('locale') || undefined
}