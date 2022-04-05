<template>
  <div id="menu" class="position-fixed d-flex flex-column align-items-center">
    <div id="medals-and-login" class="pb-3">
      <div class="d-none d-md-block">
        <player-info v-if="user" :username="user.username" />
        <nuxt-link to="/podium" class="m-2 align-self-start">Podium</nuxt-link>
      </div>
      <b-navbar toggleable="md" type="dark" class="d-md-none justify-content-end">
        <b-navbar-toggle target="nav-collapse" class="px-2" />

        <b-collapse id="nav-collapse" is-nav class="border border-secondary">
          <player-info v-if="user" :username="user.username" class="border-bottom" />
          <b-navbar-nav class="justify-content-end flex-row">
            <nuxt-link to="/podium" class="m-2 align-self-start">Podium</nuxt-link>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
  </div>
</template>
<script lang="ts">
import Index from '@prisma/client'
export default {
  name: 'DuckguessrMenu',
  props: {
    user: { type: Object as () => Index.player, default: null },
  },
}
</script>
<style lang="scss">
$navbar-height: 40px;

#menu {
  top: 0;
  left: 0;
  width: 325px;
  height: 100%;
  border-right: 1px solid #2e353d;

  @media (max-width: 767px) {
    overflow-y: hidden;
    top: 10px;
    right: 0;
    left: initial;
    width: 300px;
    height: auto;
    padding: 12px;
    z-index: 1;

    .navbar-toggler {
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
      border-bottom: 1px solid #23282e;
    }
  }
}

@media (max-width: 767px) {
  .d-flex.d-none {
    display: none !important;
  }
}
</style>
