export default function ({ $gates, redirect }) {
  if (!$gates.hasRole('admin')) {
    return redirect({ path: '/login', hash: '#403' })
  }
}
