<template>
  <div id="app">
    <banner />
    <duckguessr-menu :user="user" />
    <div id="main" class="d-flex justify-content-start flex-column">
      <div v-if="!user">Loading...</div>
      <b-row v-if="isAnonymous === true" class="justify-content-center">
        <b-alert show variant="warning" class="text-center">
          {{ t("You are not connected. You can still play but you won't get any medals.") }}
          <div>
            <a href="https://ducksmanager.net/login" target="_blank">{{
              t('Log in on DucksManager then refresh this page to be able to win medals :-)')
            }}</a>
          </div>
        </b-alert>
      </b-row>
      <Nuxt />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'
import Index from '@prisma/client'
import { useI18n } from 'nuxt-i18n-composable'
import { useCookies } from '@vueuse/integrations/useCookies'
import {
  isAnonymous as isAnonymousNative,
  setDuckguessrUserData,
  removeCookie,
  setUserCookieIfNotExists,
} from '~/composables/user'

const user = ref(null as Index.player | null)
const { t } = useI18n()

const login = () => {
  setUserCookieIfNotExists()
  io(`${process.env.SOCKET_URL}/login`, {
    auth: {
      cookie: useCookies().getAll(),
    },
  })
    .on('logged', (loggedInUser: Index.player) => {
      if (!loggedInUser) {
        // Session can't be found, regenerate the user ID
        removeCookie('PHPSESSID')
        removeCookie('duckguessr-user')
      }
      user.value = loggedInUser
      setDuckguessrUserData(loggedInUser)
    })
    .on('loginFailed', () => {
      removeCookie('PHPSESSID')
      removeCookie('duckguessr-user')
      setUserCookieIfNotExists()
      login()
    })
}

const isAnonymous = computed(() => user.value && isAnonymousNative(user.value.username))

onMounted(() => {
  login()
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
    height: 100vh;
    background-color: #3d4b5f !important;

    &.sb-main-padded {
      padding: 0 !important;
    }

    #__nuxt,
    #__layout,
    #app,
    #root {
      height: 100% !important;
    }

    #root {
      display: flex;
      flex-direction: column;
    }

    #app,
    #root {
      color: white;

      a {
        color: darkgrey;
        text-decoration: none;

        &:hover {
          border-bottom: 1px solid darkgray;
        }
      }

      #main {
        height: 100%;
        min-height: calc(100vh - 140px);
        padding: 120px 1rem 1rem 1rem;

        @media (max-width: 767px) {
          padding: 120px 0.25rem 0.25rem 0.25rem;
        }
      }
    }

    @media (min-width: 767px) {
      padding: 0 0 0 320px;
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
