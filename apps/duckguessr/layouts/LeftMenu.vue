<template>
  <div id="menu" class="position-fixed d-flex flex-column align-items-center">
    <div id="medals-and-login" class="pb-3">
      <player-info v-if="user" :username="user.username" />
    </div>
    <nuxt-link to="/podium" class="m-2 align-self-start">Podium</nuxt-link>
  </div>
</template>
<script lang="ts" setup>
import Index from '@prisma/client'
defineProps<{
  user: Index.player | null
}>()
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
    position: fixed;
    width: 100%;
    height: 38px;
    margin-bottom: 10px;
    opacity: 0.95;
    outline: 2px solid grey;

    .toggle-btn {
      display: block;
      cursor: pointer;
      position: absolute;
      right: 15px;
      top: 10px;
      z-index: 10 !important;
      padding: 3px;
      width: 40px;
      text-align: center;
    }

    #medals_and_login {
      display: none;
    }

    .navbar {
      height: $navbar-height;

      .navbar-brand {
        position: fixed;
      }

      .navbar-toggler {
        border-color: rgba(255, 255, 255, 0.5);
      }

      .navbar-collapse {
        .menu-content {
          position: fixed;
          left: 0;
          top: 40px;
          width: 100%;

          li {
            padding-right: 30px;
          }
        }
      }
    }

    #login_status {
      display: inline-block;
      max-width: 145px;
      overflow-x: hidden;
      white-space: nowrap;
      text-align: right;
      vertical-align: middle;
      margin-top: 0;
      margin-right: 10px;
    }

    #zone_logo1 {
      display: none;
    }

    #zone_logo2 {
      background: none;
      margin-top: 40px;
    }

    #nb_users,
    #flags {
      position: static;
      width: inherit;
      text-align: center;
      float: none;
    }
  }

  #medals-and-login {
    width: 100%;
    border-bottom: 1px solid #23282e;
  }
}
</style>
