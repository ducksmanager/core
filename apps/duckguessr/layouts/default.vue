<template>
  <div id="app">
    <div id="menu" class="position-fixed d-flex justify-content-center">
      <div id="medals-and-login">
        <div v-if="username">{{ username }}</div>
      </div>
    </div>
    <div id="logo-zone" class="d-flex align-items-center flex-column">
      <div><b-img src="/logo.png" height="70" /></div>
      <small>by DucksManager</small>
    </div>
    <div id="main" class="d-flex justify-content-center align-items-center">
      <Nuxt />
    </div>
  </div>
</template>

<script setup>
import useUser from '@/components/user'
const username = useUser().username
</script>

<style lang="scss">
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
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

    #app {
      color: white;

      #menu {
        top: 0;
        left: 0;
        width: 325px;
        height: 100%;
        border-right: 1px solid #2e353d;
      }

      #logo-zone {
        height: 180px;
      }

      #main {
        height: calc(100vh - 180px);
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
