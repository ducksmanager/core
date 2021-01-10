<template>
  <b-container>
    <b-row class="vh-100 text-center" align-v="center">
      <b-col class="d-flex flex-column align-items-center" cols="6" offset="3" md="4" offset-md="4">
        <h2>EdgeCreator</h2>
        <b-form @submit.prevent="login()">
          <b-form-input
            id="username"
            v-model="loginUsername"
            :placeholder="$t('Username')"
            required
          ></b-form-input>

          <b-form-input
            id="password"
            v-model="password"
            :placeholder="$t('Password')"
            class="mt-3"
            type="password"
            required
          ></b-form-input>
          <b-button type="submit" variant="primary" class="mt-3">{{ $t('Login') }}</b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import redirectMixin from '@/mixins/redirectMixin'

const crypto = require('crypto')

const roleMapping = {
  Affichage: 'display',
  Edition: 'edit',
  Admin: 'admin',
}

export default {
  mixins: [redirectMixin],
  data() {
    return {
      loginUsername: null,
      password: null,
    }
  },
  methods: {
    login() {
      const password = crypto.createHash('sha1').update(this.password).digest('hex')
      const vm = this
      this.$axios
        .$get('/api/collection/privileges', {
          headers: {
            'x-dm-user': this.loginUsername,
            'x-dm-pass': password,
          },
        })
        .then((data) => {
          vm.$cookies.setAll([
            { name: 'dm-user', value: vm.loginUsername },
            { name: 'dm-pass', value: password },
          ])
          vm.$gates.setRoles([roleMapping[data.EdgeCreator] || 'display'])
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
