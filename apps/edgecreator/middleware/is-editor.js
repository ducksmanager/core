export default function ({ $gates, redirect }) {
  if (!$gates.unlessRole('display')) {
    return redirect({ path: '/', hash: '#403' })
  }
}
