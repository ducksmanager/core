<template>
  <div
    v-if="l10n"
    id="menu"
  >
    <div id="medailles_et_login">
      <div id="medailles">
        <span
          v-for="level in userPoints"
          :key="level"
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
            class="medaille"
            :src="`images/medailles/${level.contribution}_${level.levelReached}_${locale}.png`"
          >
        </span>
      </div>
    </div>
    <RecentEvents />
  </div>
</template>

<script>
import axios from "axios";
import l10nMixin from "../mixins/l10nMixin";
import medalsMixin from "../mixins/medalsMixin";
import RecentEvents from "./RecentEvents";

export default {
  name: "Menu",

  components: {
    RecentEvents
  },

  mixins: [l10nMixin, medalsMixin],

  data: () => ({
    medalColors: ['bronze', 'argent', 'or']
  }),

  async mounted() {
    await axios.post('/api/collection/collection/lastvisit')
  }
}
</script>

<style scoped>

#menu {
  font-family: verdana, sans-serif;
  font-size: 12px;
  font-weight: 200;
  background-color: #2e353d;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 800;
  color: #e1ffff;
  overflow-y: auto;
}

#menu .toggle-btn {
  display: none;
}

#menu ul,
#menu li {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 25px;
  cursor: pointer;
}

#menu ul .active,
#menu li .active {
  border-left: 3px solid rgb(200, 137, 100);
  background-color: #4f5b69;
}

#menu ul .sub-menu li.active,
#menu li .sub-menu li.active {
  color: rgb(200, 137, 100);
}

#menu ul .sub-menu li.active a,
#menu li .sub-menu li.active a {
  color: rgb(200, 137, 100);
}

#menu ul .sub-menu li,
#menu li .sub-menu li {
  background-color: #181c20;
  border: none;
  line-height: 28px;
  border-bottom: 1px solid #23282e;
  padding-left: 10px;
  margin-left: 0;
}

#menu ul .sub-menu li:hover,
#menu li .sub-menu li:hover {
  background-color: #020203;
}

#menu li {
  padding-left: 3px;
}

#menu li.empty {
  height: 10px;
}

#menu li a {
  display: block;
  text-decoration: none;
  color: #e1ffff;
}

#menu li a i {
  padding-left: 10px;
  width: 15px;
  padding-right: 5px;
}

#menu li.no-icon a i {
  padding-left: 5px;
}

#menu li.non-empty:hover {
  border-left: 3px solid rgb(200, 137, 100);
  background-color: #4f5b69;
  -webkit-transition: all 0.1s ease;
  -moz-transition: all 0.1s ease;
  -o-transition: all 0.1s ease;
  -ms-transition: all 0.1s ease;
  transition: all 0.1s ease;
}

#menu li.empty {
  cursor: default;
}

#menu a:hover {
  border-bottom: 0 !important;
}

#medailles_et_login {
  vertical-align: bottom;
  text-align: center;
  background-color: #2e353d;
  padding: 5px 5px 5px 3px;
}

#medailles_et_login #medailles {
  white-space: nowrap;
}

#medailles_et_login #medailles .medaille {
  height: 120px;
  margin-left: 5px;
}

#medailles_et_login #medailles .overlay {
  position: absolute;
  display: inline-block;
  margin-left: 1px;
  margin-top: 2px;
}

#medailles_et_login #medailles .overlay .title {
  position: absolute;
  width: 100px;
  height: 120px;
}

#medailles_et_login #medailles .overlay svg circle {
  stroke-dashoffset: 0;
  stroke: #2e353d;
  stroke-width: 5px;
}

#medailles_et_login #medailles .overlay svg circle.bar.bronze {
  stroke: #B87333;
}

#medailles_et_login #medailles .overlay svg circle.bar.argent {
  stroke: silver;
}

#medailles_et_login #medailles .overlay svg circle.bar.or {
  stroke: #e6ac00;
}

#medailles_et_login #login {
  line-height: 26px;
}

@media (max-width: 767px) {
  #menu {
    overflow-y: hidden;
    position: fixed;
    width: 100%;
    margin-bottom: 10px;
    opacity: 0.9;
    outline: 2px solid grey;
  }

  #menu .toggle-btn {
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

  #menu #medailles,
  #menu #recemment {
    display: none;
  }

  #medailles_et_login #login {
    margin-right: 35px;
    text-align: right;
  }

  #medailles_et_login #login .logo_petit {
    float: left;
    margin-top: 5px;
  }

  #texte_connecte {
    display: inline-block;
    max-width: 145px;
    overflow-x: hidden;
    white-space: nowrap;
    text-align: right;
    vertical-align: middle;
    margin-top: 0;
    margin-right: 10px;
  }

  #menu li.empty {
    display: none;
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
  }

  #menu .menu-list .menu-content {
    display: block;
  }

  #medailles_et_login {
    height: 170px;
  }

  #medailles_et_login #login {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  #medailles_et_login #login #logo_petit {
    display: none;
  }

}


#menu a {
  border-bottom: none;
}

</style>