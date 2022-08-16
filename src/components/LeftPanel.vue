<template>
  <div id="menu">
    <div id="medals_and_login">
      <div v-if="points[userId]" id="medals">
        <Medal
          v-for="(numberOfPoints, contribution) in points[userId] || {}"
          :key="contribution"
          :contribution="contribution"
          :user-level-points="numberOfPoints"
        />
      </div>
      <div id="login">
        <a id="logo_small" :href="username ? r('/collection/show') : '/'">
          <img src="/images/logo_name.jpg">
        </a>

        <div v-if="username" id="login_status">
          <img alt="O" src="/images/icons/green.png">&nbsp;
          <span>{{ username }}</span>
        </div>
      </div>
    </div>
    <Navigation v-once class="d-none d-md-block" />
    <nav v-once class="navbar navbar-dark d-block d-md-none">
      <div class="container-fluid">
        <Popper placement="bottom" teleport="body">
          <template #content>
            <Navigation />
          </template>
          <button class="navbar-toggler" type="button">
            <span class="navbar-toggler-icon" />
          </button>
        </Popper>

        <a class="navbar-brand" href="#">
          <SwitchLocale fixed />
          <Banner small /></a>
      </div>
    </nav>
    <RecentEvents />
  </div>
</template>

<script setup>
import Popper from '@bperel/vue3-popper-teleport'

import { collection } from '~/stores/collection'
import { l10n } from '~/stores/l10n'
import { users } from '~/stores/users'
import { user } from '~/composables/global'

const points = $computed(() => users().points)
const { userId, username } = user()
const { r } = l10n()

if (userId) {
  collection().collectionApi
    .post('/api/collection/lastvisit')
    .then(data => collection().setPreviousVisit(data))
  users().fetchStats([userId])
}
</script>

<style scoped lang="scss">
@import "~/styles/main";
#menu {
  font-size: 12px;
  font-weight: 200;
  background-color: #2e353d;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 800;
  color: #e1ffff;
  overflow-y: auto;

  .toggle-btn {
    display: none;
  }

  a:hover {
    border-bottom: 0 !important;
  }
}

#medals_and_login {
  vertical-align: bottom;
  text-align: center;
  background-color: #2e353d;
  padding: 5px 5px 5px 3px;

  #medals {
    white-space: nowrap;
  }

  #login {
    line-height: 26px;
  }
}

@media (max-width: 767px) {
  #menu {
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

@media (min-width: 767px) {
  #menu {
    width: 325px;
    height: 100%;

    .menu-list .menu-content {
      display: block;
    }
  }

  #medals_and_login {
    height: 170px;

    #login {
      margin-top: 10px;
      margin-bottom: 10px;

      #logo_small {
        display: none;
      }
    }
  }
}

#menu a {
  border-bottom: none;
}
</style>
