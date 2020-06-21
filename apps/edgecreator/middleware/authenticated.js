export default function ({ redirect, app }) {
  if (!app.$cookies.get('dm-user')) {
    return redirect('/login')
  }
}
