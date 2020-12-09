export default function ({ $gates, redirect }) {
  if (!$gates.hasRole('admin')) {
    return redirect({ path: '/', hash: '#403' })
  }
}
