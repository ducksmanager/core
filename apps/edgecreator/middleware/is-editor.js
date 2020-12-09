export default function ({ $gates, redirect }) {
  if (!$gates.hasRole('edit')) {
    return redirect('/login')
  }
}
