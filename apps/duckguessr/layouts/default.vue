<template>
  <div id="app">
    <div id="menu" class="position-fixed d-flex flex-column align-items-center">
      <div id="medals-and-login" class="pb-3">
        <user-info v-if="user" :username="user.username" />
      </div>
      <nuxt-link to="/podium" class="m-2 align-self-start">Podium</nuxt-link>
    </div>
    <div id="logo-zone" class="p-4 d-flex align-items-center flex-column align-items-center">
      <a href="/"><b-img src="/logo.png" height="70" /></a>
      <small>by DucksManager</small>
    </div>
    <div v-if="!user">Loading...</div>
    <div v-else>
      <b-row class="justify-content-center">
        <b-alert v-if="isAnonymous === true" show variant="warning">
          You are not connected. You can still play but you won't get any medals.
        </b-alert>
      </b-row>
      <div id="main" class="d-flex justify-content-center align-items-center">
        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from '@nuxtjs/composition-api'
import { defineComponent } from '@vue/runtime-dom'
import { io } from 'socket.io-client'
import Index from '@prisma/client'
import { isAnonymous, setUserCookieIfNotExists } from '~/composables/user'

export default defineComponent({
  setup() {
    const user = ref(null as Index.player | null)

    onMounted(() => {
      setUserCookieIfNotExists()
      io(`${process.env.SOCKET_URL}/login`, {
        auth: {
          cookie: document.cookie,
        },
      }).on('logged', (loggedInUser) => {
        console.log(loggedInUser)
        user.value = loggedInUser
      })
    })

    return {
      user,
      isAnonymous: computed(() => user.value && isAnonymous(user.value.username)),
    }
  },
})
</script>

<style lang="scss">
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;

  body {
    padding: 0 0 0 320px;
    background-color: #3d4b5f !important;

    #app,
    #root {
      color: white;

      a {
        color: darkgrey;
        border-bottom: 1px solid darkgray;
        text-decoration: none;
      }

      #menu {
        top: 0;
        left: 0;
        width: 325px;
        height: 100%;
        border-right: 1px solid #2e353d;

        #medals-and-login {
          width: 100%;
          border-bottom: 1px solid #23282e;
        }
      }

      #logo-zone {
        a {
          border-bottom: 0;
        }
      }

      #main {
        min-height: calc(100vh - 140px);
        padding: 0 20px 20px 20px;
      }
    }
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
