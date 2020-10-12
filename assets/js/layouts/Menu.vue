<template>
  <div
    v-if="l10n"
    id="menu"
  >
    <div id="medals_and_login">
      <div id="medals">
        <span
          v-for="level in userPoints"
          :key="level.contribution"
        >
          <div class="overlay">
            <div
              class="title"
              :title="$t(`DETAILS_MEDAILLE_${level.contribution.toUpperCase()}_MAX`, [
                level.userPoints,
                level.pointsDiffNextLevel,
                $t(`MEDAILLE_${level.levelReached+1}`)
              ])"
            />
            <svg
              v-if="level.levelReached < 3"
              width="100"
              height="100"
              viewport="0 0 0 0"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                :r="radius"
                cx="50"
                cy="50"
                fill="transparent"
                :stroke-dasharray="circumference"
                stroke-dashoffset="0"
              />
              <circle
                transform="rotate(270,0,0)"
                :class="{bar: true, [medalColors[level.levelReached]]: true}"
                cx="-50"
                cy="50"
                :r="radius"
                fill="transparent"
                :stroke-dasharray="circumference"
                :style="`stroke-dashoffset: ${level.levelProgressPercentage}px`"
              />
            </svg>
          </div>
          <img
            class="medal"
            :src="`${imagePath}/medals/${level.contribution}_${level.levelReached}_${locale}.png`"
          >
        </span>
      </div>
      <div id="login">
        <a
          id="logo_small"
          :href="username ? '/?action=gerer' : '/'"
        >
          <img :src="`${imagePath}/logo_name.jpg`">
        </a>

        <div
          v-if="username"
          id="login_status"
        >
          <img
            alt="O"
            :src="`${imagePath}/green.png`"
          >&nbsp;
          <span>{{ username }}</span>
        </div>
      </div>
    </div>
    <Navigation />
    <RecentEvents />
  </div>
</template>

<script>
import axios from "axios";
import l10nMixin from "../mixins/l10nMixin";
import medalsMixin from "../mixins/medalsMixin";
import RecentEvents from "./RecentEvents";
import Navigation from "./Navigation";

export default {
  name: "Menu",

  components: {
    RecentEvents,
    Navigation
  },

  mixins: [l10nMixin, medalsMixin],

  data: () => ({
    medalColors: ['bronze', 'argent', 'or']
  }),

  computed: {
    username: () => window.username,
    imagePath: () => window.imagePath,
    locale: () => window.locale
  },

  async mounted() {
    await axios.post('/api/collection/lastvisit')
  }
}
</script>

<style scoped lang="scss">
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

    .medal {
      height: 120px;
      margin-left: 5px;
    }

    .overlay {
      position: absolute;
      display: inline-block;
      margin-left: 1px;
      margin-top: 2px;

      .title {
        position: absolute;
        width: 100px;
        height: 120px;
      }

      svg circle {
        stroke-dashoffset: 0;
        stroke: #2e353d;
        stroke-width: 5px;

        &.bar {
          &.bronze {
            stroke: #B87333;
          }

          &.argent {
            stroke: silver;
          }

          &.or {
            stroke: #e6ac00;
          }
        }
      }
    }
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
    margin-bottom: 10px;
    opacity: 0.9;
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

    #medals, #recemment {
      display: none;
    }
  }

  #medals_and_login #login {
    margin-right: 35px;
    text-align: right;

    #logo_small {
      float: left;
      margin-top: 5px;
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

  #nb_users, #flags {
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