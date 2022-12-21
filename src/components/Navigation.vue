<template>
  <ul id="menu-content" class="menu-content collapse show">
    <NavigationItemGroup
      :paths="[
        /^\/collection/,
        /^\/bookcase-show/,
        /^\/stats/,
        /^\/expand/,
        /^\/print/,
      ]"
      icon="glyphicon-home"
    >
      <template #text>
        <b-icon-house-fill />
        {{ $t("Collection") }}
      </template>
      <template v-if="username !== undefined" #items>
        <template v-if="username">
          <NavigationItem>
            <router-link to="/bookcase/show">
              <b-icon-book-half />
              {{ $t("Ma bibliothèque") }}
            </router-link>
          </NavigationItem>
          <NavigationItem>
            <router-link to="/collection/show">
              <b-icon-list /> {{ $t("Gérer ma collection") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <router-link to="/stats/general">
              <b-icon-graph-up />
              {{ $t("Statistiques de ma collection") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <router-link to="/expand/suggestions">
              <b-icon-capslock-fill />
              {{ $t("Agrandir ma collection") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <router-link to="/expand/suggestions">
              <div
                class="b-custom"
                :style="{
                  backgroundImage: `url(/images/icons/inducks.png)`,
                }"
              />
              {{ $t("Collection Inducks") }}
            </router-link>
          </NavigationItem>
          <NavigationItem>
            <router-link to="/print">
              <b-icon-printer-fill />
              {{ $t("Imprimer ma collection") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <span @click="logout">
              <b-icon-x-square-fill />
              {{ $t("Déconnexion") }}</span
            >
          </NavigationItem>
        </template>
        <template v-else>
          <NavigationItem>
            <router-link to="/signup">
              <i class="glyphicon glyphicon-certificate" />
              {{ $t("Inscription") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <router-link to="/login">
              <i class="glyphicon glyphicon-folder-open" />
              {{ $t("Connexion") }}
            </router-link>
          </NavigationItem>
        </template>
      </template>
    </NavigationItemGroup>
    <li class="empty" />
    <NavigationItem
      ><router-link to="/bookstores">
        {{ $t("Trouver des bouquineries") }}</router-link
      >
    </NavigationItem>
    <NavigationItem v-if="!username"
      ><router-link to="/inducks/import">
        {{ $t("Vous possédez une collection Inducks ?") }}</router-link
      >
    </NavigationItem>
    <NavigationItem v-if="!username"
      ><router-link to="/demo"> {{ $t("Une petite démo ?") }}</router-link>
    </NavigationItem>
  </ul>
</template>

<script setup lang="ts">
import {
  BIconBookHalf,
  BIconCapslockFill,
  BIconGraphUp,
  BIconHouseFill,
  BIconList,
  BIconPrinterFill,
  BIconXSquareFill,
} from "bootstrap-icons-vue";
import Cookies from "js-cookie";

import { collection } from "~/stores/collection";

const username = $computed(() => collection().user?.username || null);

const logout = () => {
  Cookies.remove("token");
  collection().user = null;
};
</script>

<style lang="scss" scoped>
#menu-content {
  height: 0;
  padding: 0;
}

.b-custom {
  display: inline-block;
  background-repeat: no-repeat;
  height: 12px;
  background-size: 12px;
  width: 12px;
  background-position: bottom;
}

:deep(ul),
li {
  background-color: #3d4b5f;
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 25px;
  cursor: pointer;

  .sub-menu li {
    background-color: #181c20;
    border: none;
    line-height: 28px;
    border-bottom: 1px solid #23282e;
    padding-left: 20px;
    margin-left: 0;

    &:hover {
      background-color: #020203;
    }

    &.active,
    &.active a {
      color: #c88964;
    }
  }

  &.active {
    border-left: 3px solid #c88964;
    background-color: #4f5b69;
  }
}

:deep(li) {
  .sub-menu li:hover {
    background-color: #020203;
  }

  &.empty {
    height: 10px;
  }

  a {
    display: block;
    text-decoration: none !important;
    color: inherit !important;
    border-bottom: 0 !important;

    i {
      padding-left: 10px;
      width: 15px;
      padding-right: 5px;
    }
  }

  &.no-icon a i {
    padding-left: 5px;
  }

  &.non-empty:hover {
    border-left: 3px solid rgb(200, 137, 100);
    background-color: #4f5b69;
    -webkit-transition: all 0.1s ease;
    -moz-transition: all 0.1s ease;
    -o-transition: all 0.1s ease;
    -ms-transition: all 0.1s ease;
    transition: all 0.1s ease;
  }

  &.empty {
    cursor: default;
  }
}

@media (max-width: 767px) {
  :deep(li.empty) {
    display: none;
  }
}
</style>
