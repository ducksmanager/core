<template>
  <div id="menu" class="position-fixed d-flex flex-column align-items-center">
    <div id="medals-and-login" class="py-2 d-flex flex-column">
      <div class="d-none d-lg-block">
        <component :is="isAnonymous ? 'div' : 'a'" :href="isAnonymous ? undefined : '/profile'">
          <player-info
            v-if="user"
            class="mb-2"
            :username="user.username"
            :avatar="user.avatar"
            no-right-panel
          />
        </component>
        <medal-list v-if="!isAnonymous && currentUserStats" :with-details="false" :cols="3" />
      </div>
      <b-navbar toggleable="lg" type="dark" class="d-lg-none justify-content-start pt-0">
        <b-navbar-toggle target="nav-collapse" class="px-2" />

        <b-collapse id="nav-collapse" is-nav class="border border-secondary mt-4">
          <div class="border-bottom">
            <player-info v-if="user" :username="user.username" :avatar="user.avatar" />
            <medal-list v-if="!isAnonymous && currentUserStats" :with-details="false" :cols="3" />
          </div>
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
import { computed, watch } from '@nuxtjs/composition-api'
import { userStore } from '~/store/user'

const user = computed(() => userStore().user)
const isAnonymous = computed(() => userStore().isAnonymous)

const currentUserStats = computed(() => userStore().stats)

watch(
  () => isAnonymous.value === false,
  (userIsNotAnonymous: boolean) => {
    if (userIsNotAnonymous) {
      userStore().loadStats()
    }
  },
  { immediate: true }
)
</script>
<style lang="scss">
$navbar-height: 40px;

#menu {
  top: 0;
  left: 0;
  width: 325px;
  height: 100%;
  border-right: 5px solid #eee;
  background-color: #3d4b5f !important;
  z-index: 2;

  @media (max-width: 992px) {
    overflow-y: hidden;
    border-right: none;
    top: 10px;
    left: 0;
    width: auto;
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
