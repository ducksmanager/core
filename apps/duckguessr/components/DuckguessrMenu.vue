<template>
  <div id="menu" class="position-fixed d-flex flex-column align-items-center">
    <div id="medals-and-login" class="py-2 d-flex flex-column">
      <component
        :is="isAnonymous ? 'div' : 'a'"
        :href="isAnonymous ? undefined : '/profile'"
        class="d-none d-lg-block"
      >
        <player-info v-if="user" :username="user.username" :avatar="user.avatar" />
      </component>
      <b-navbar toggleable="lg" type="dark" class="d-lg-none justify-content-start">
        <b-navbar-toggle target="nav-collapse" class="px-2" />

        <b-collapse id="nav-collapse" is-nav class="border border-secondary mt-4">
          <player-info
            v-if="user"
            :username="user.username"
            :avatar="user.avatar"
            class="border-bottom"
          />
          <b-navbar-nav class="justify-content-start flex-column">
            <nuxt-link to="/" class="mx-2 align-self-start">{{ $t('Home') }}</nuxt-link>
            <nuxt-link to="/podium" class="mx-2 align-self-start">
              {{ $t('Podium') }}
            </nuxt-link>
            <nuxt-link v-if="!isAnonymous" to="/profile" class="mx-2 align-self-start">
              {{ $t('My profile') }}
            </nuxt-link>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <language-switch-dropdown />
    </div>
    <nuxt-link to="/" class="d-none d-lg-block mx-2 align-self-start">
      {{ $t('Home') }}
    </nuxt-link>
    <nuxt-link to="/podium" class="d-none d-lg-block mx-2 align-self-start">
      {{ $t('Podium') }}
    </nuxt-link>
    <nuxt-link v-if="!isAnonymous" to="/profile" class="d-none d-lg-block mx-2 align-self-start">
      {{ $t('My profile') }}
    </nuxt-link>
  </div>
</template>
<script lang="ts" setup>
import { computed } from '@nuxtjs/composition-api'
import { userStore } from '~/store/user'

const user = computed(() => userStore().user)
const isAnonymous = computed(() => userStore().isAnonymous)
</script>
<style lang="scss">
$navbar-height: 40px;

#menu {
  top: 0;
  left: 0;
  width: 325px;
  height: 100%;
  border-right: 5px solid #eee;
  z-index: 2;

  @media (max-width: 992px) {
    overflow-y: hidden;
    border-right: none;
    top: 10px;
    left: 0;
    width: 300px;
    height: auto;
    padding: 12px;
    z-index: 1;

    .navbar-toggler,
    .dropdown-toggle {
      background: #3d4b5f !important;
    }

    .navbar-collapse {
      border-radius: 5px;
      background: #3d4b5f !important;
      margin-top: 10px;
    }

    .navbar-nav {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
  }

  #medals-and-login {
    width: 100%;
    @media (min-width: 992px) {
      border-bottom: 5px solid #eee;
    }

    a:hover {
      border-bottom: 0;
      .username {
        border-bottom: 1px solid darkgrey;
      }
    }

    #language-navbar {
      position: fixed;
      right: 0;
      top: 0;
      padding-top: 2rem;
      padding-right: 1.5rem;

      .dropdown-item {
        border: none;
        &.active,
        &:active {
          color: black;
          background-color: initial;
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .d-flex.d-none {
    display: none !important;
  }
}
</style>
