<template>
  <b-container>
    <b-row class="vh-100 text-center" align-v="center">
      <b-col cols="4" offset="4">
        <h2>EdgeCreator</h2>
        <b-form @submit.prevent="login()">
          <b-form-input
            id="username"
            v-model="username"
            :placeholder="$t('username')"
            required
          ></b-form-input>

          <b-form-input
            id="password"
            v-model="password"
            :placeholder="$t('password')"
            class="mt-3"
            type="password"
            required
          ></b-form-input>
          <b-button type="submit" variant="primary">{{ $t('login') }}</b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
const crypto = require('crypto')

export default {
  data() {
    return {
      username: null,
      password: null,
    }
  },
  methods: {
    login() {
      const password = crypto.createHash('sha1').update(this.password).digest('hex')
      const vm = this
      this.$axios
        .$get('/api/edgecreator/v2/model', {
          headers: {
            'x-dm-user': this.username,
            'x-dm-pass': password,
          },
        })
        .then(() => {
          vm.$cookies.setAll([
            { name: 'dm-user', value: vm.username },
            { name: 'dm-pass', value: password },
          ])
          vm.$router.push('/')
        })
        .catch((e) => {
          vm.$bvToast.toast(e.message, {
            title: 'Error',
            autoHideDelay: 3000,
          })
        })
    },
  },
}
</script>
