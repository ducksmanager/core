<template>
  <div id="menu">
    <div id="medals_and_login">
      <div v-if="user && points[user.id]" id="medals">
        <Medal
          v-for="(numberOfPoints, contribution) in points[user.id] || {}"
          :key="contribution"
          :contribution="contribution"
          :user-level-points="numberOfPoints"
        />
      </div>
      <div id="login">
        <router-link id="logo_small" :to="user ? '/collection/show' : '/'">
          <img :src="getImagePath('logo_name.jpg')" />
        </router-link>

        <div v-if="user" id="login_status">
          <img alt="O" :src="getImagePath('icons/green.png')" />&nbsp;
          <span>{{ user.username }}</span>
        </div>
      </div>
    </div>
    <Navigation v-once />
    <RecentEvents />
  </div>
</template>

<script setup lang="ts">
const { getImagePath } = images();
const { points } = storeToRefs(users());

const { loadPreviousVisit } = collection();
const { user } = storeToRefs(collection());

const { fetchStats } = users();

watch(
  user,
  (newValue) => {
    if (newValue) {
      loadPreviousVisit();
      fetchStats([newValue.id]);
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "../styles/main.scss";

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
  #medals_and_login {
    display: none;
  }

  :deep(.navbar) {
    .navbar-toggler {
      box-shadow: none;
      position: fixed;
      margin: 5px;
      top: 0;
      border-color: rgba(255, 255, 255, 0.5);
    }

    .navbar-collapse {
      position: fixed;
      top: 40px;
      background-color: rgba(46, 53, 61, 0.9);
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
