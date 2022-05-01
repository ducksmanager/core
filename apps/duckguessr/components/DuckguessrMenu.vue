<template>
  <div id="menu" class="position-fixed d-flex flex-column align-items-center">
    <div id="medals-and-login" class="pb-3">
      <div class="d-none d-md-block">
        <player-info v-if="user" :username="user.username" />
      </div>
      <b-navbar toggleable="md" type="dark" class="d-md-none justify-content-start">
        <b-navbar-toggle target="nav-collapse" class="px-2" />

        <b-collapse id="nav-collapse" is-nav class="border border-secondary">
          <player-info v-if="user" :username="user.username" class="border-bottom" />
          <b-navbar-nav class="justify-content-start flex-row">
            <nuxt-link to="/podium" class="m-2 align-self-start">Podium</nuxt-link>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <language-switch-dropdown />
    </div>
    <nuxt-link to="/podium" class="d-none d-md-block m-2 align-self-start">Podium</nuxt-link>
  </div>
</template>
<script lang="ts" setup>
import Index from '@prisma/client'

withDefaults(
  defineProps<{
    user: Index.player | null
  }>(),
  {
    user: null,
  }
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

  @media (max-width: 767px) {
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
  }

  #medals-and-login {
    width: 100%;
    @media (min-width: 767px) {
      border-bottom: 5px solid #eee;
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

@media (max-width: 767px) {
  .d-flex.d-none {
    display: none !important;
  }
}
</style>
