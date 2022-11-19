<template>
  <ul id="menu-content" class="menu-content collapse show">
    <NavigationItemGroup path="collection" icon="glyphicon-home">
      <template #text>
        <b-icon-house-fill />
        {{ $t("Collection") }}
      </template>
      <template v-if="username !== undefined" #items>
        <template v-if="username">
          <NavigationItem path="/bookcase/show">
            <b-icon-book-half />
            {{ $t("Ma bibliothèque") }}
          </NavigationItem>
          <NavigationItem path="/collection/show">
            <b-icon-list />
            {{ $t("Gérer ma collection") }}
          </NavigationItem>
          <NavigationItem path="/stats/general">
            <b-icon-graph-up />
            {{ $t("Statistiques de ma collection") }}
          </NavigationItem>
          <NavigationItem path="/expand/suggestions">
            <b-icon-capslock-fill />
            {{ $t("Agrandir ma collection") }}
          </NavigationItem>
          <NavigationItem path="/inducks/import">
            <div
              class="b-custom"
              :style="{
                backgroundImage: `url(/images/icons/inducks.png)`,
              }"
            />
            {{ $t("Collection Inducks") }}
          </NavigationItem>
          <NavigationItem path="/print">
            <b-icon-printer-fill />
            {{ $t("Imprimer ma collection") }}
          </NavigationItem>
          <NavigationItem path="/logout">
            <b-icon-x-square-fill />
            {{ $t("Déconnexion") }}
          </NavigationItem>
        </template>
        <template v-else>
          <NavigationItem path="/signup" icon="glyphicon glyphicon-certificate">
            {{ $t("Inscription") }}
          </NavigationItem>
          <NavigationItem path="/login" icon="glyphicon glyphicon-folder-open">
            {{ $t("Connexion") }}
          </NavigationItem>
        </template>
      </template>
    </NavigationItemGroup>
    <li class="empty" />
    <NavigationItem path="/bookstores">
      {{ $t("Trouver des bouquineries") }}
    </NavigationItem>
    <NavigationItem v-if="!username" path="/inducks/import">
      {{ $t("Vous possédez une collection Inducks ?") }}
    </NavigationItem>
    <NavigationItem v-if="!username" path="/demo">
      {{ $t("Une petite démo ?") }}
    </NavigationItem>
  </ul>
</template>

<script setup>
import {
  BIconBookHalf,
  BIconCapslockFill,
  BIconGraphUp,
  BIconHouseFill,
  BIconList,
  BIconPrinterFill,
  BIconXSquareFill,
} from "bootstrap-icons-vue";

import { collection } from "~/stores/collection";

let username = $computed(() => collection().user?.username || null);
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
    padding-left: 10px;
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
