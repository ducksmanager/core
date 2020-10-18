<template>
  <form method="post">
    <div
      v-if="error"
      class="alert alert-danger"
    >
      {{ error }}
    </div>

    <h1 class="h3 mb-3 font-weight-normal">
      Please sign in
    </h1>
    <label for="inputUsername">Username</label>
    <input
      id="inputUsername"
      type="text"
      :value="lastUsername"
      name="username"
      class="form-control"
      required
      autofocus
    >
    <label for="inputPassword">Password</label>
    <input
      id="inputPassword"
      type="password"
      name="password"
      class="form-control"
      required
    >

    <input
      type="hidden"
      name="_csrf_token"
      :value="csrfToken"
    >

    <button
      class="btn btn-lg btn-primary"
      type="submit"
    >
      Sign in
    </button>
  </form>
</template>

<script>
export default {
  name: "Login",
  props: {
    error: {type: String, default: null},
    lastUsername: {type: String, default: null}
  },
  data() {
    return {
      csrfToken: document.getElementById('csrf').value
    }
  }
}
</script>

<style scoped>

</style>