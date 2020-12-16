export default function ({ redirect, app }) {
  if (!app.$cookies.get('dm-user')) {
    return redirect({ path: '/login', hash: '#401' })
  }
}
