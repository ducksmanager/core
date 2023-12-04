<template>
  <div id="menu" class="d-flex flex-column align-items-center">
    <router-link to="/" class="d-none d-lg-block mx-2 align-self-start">
      {{ $t("Home") }}
    </router-link>
    <router-link to="/podium" class="d-none d-lg-block mx-2 align-self-start">
      {{ $t("Podium") }}
    </router-link>
    <router-link
      v-if="!isAnonymous"
      to="/profile"
      class="d-none d-lg-block mx-2 align-self-start"
    >
      {{ $t("My profile") }}
    </router-link>
  </div>
</template>
<script lang="ts" setup>
import { userStore } from "~/stores/user";

const isAnonymous = computed(() => userStore().isAnonymous);

watch(
  () => isAnonymous.value === false,
  (userIsNotAnonymous: boolean) => {
    if (userIsNotAnonymous) {
      userStore().loadStats();
    }
  },
  { immediate: true }
);
</script>
<style lang="scss">
$navbar-height: 40px;

#menu {
  background-color: #3d4b5f !important;
  z-index: 2;

  @media (max-width: 992px) {
    overflow-y: hidden;
    border-right: none;
    top: 10px;
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
