<template>
  <ul id="menu-content" class="menu-content collapse show">
    <NavigationItemGroup
      :paths="[
        /^\/collection(?!\/user)/,
        /^\/bookcase(?!\/show\/.+)/,
        /^\/stats/,
        /^\/expand/,
        /^\/print/,
      ]"
      icon="glyphicon-home"
    >
      <template #text>
        <i-bi-house-fill />
        <span>{{ $t("Collection") }}</span>
      </template>
      <template v-if="username !== undefined" #items>
        <template v-if="username">
          <NavigationItem>
            <router-link to="/bookcase/show">
              <i-bi-book-half />
              {{ $t("Ma bibliothèque") }}
            </router-link>
          </NavigationItem>
          <NavigationItem>
            <router-link to="/collection/show">
              <i-bi-list /> {{ $t("Gérer ma collection") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <router-link to="/stats/general">
              <i-bi-graph-up />
              {{ $t("Statistiques de ma collection") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <router-link to="/expand/suggestions">
              <i-bi-capslock-fill />
              {{ $t("Agrandir ma collection") }}&nbsp;<sup>{{
                $t("Nouveau !")
              }}</sup></router-link
            >
          </NavigationItem>
          <NavigationItem>
            <router-link to="/inducks/import">
              <div
                class="b-custom"
                :style="{
                  backgroundImage: `url(${getImagePath('icons/inducks.png')})`,
                }"
              />
              {{ $t("Collection Inducks") }}
            </router-link>
          </NavigationItem>
          <NavigationItem>
            <router-link to="/print">
              <i-bi-printer-fill />
              {{ $t("Imprimer ma collection") }}</router-link
            >
          </NavigationItem>
          <NavigationItem>
            <div @click="logout">
              <i-bi-x-square-fill />
              {{ $t("Déconnexion") }}
            </div>
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
    <template v-if="publicCollectionUsername">
      <li class="empty" />
      <NavigationItemGroup
        v-if="publicCollectionUsername"
        :paths="[/^\/collection\/user/, /^\/bookcase\/show\/.+/]"
        icon="glyphicon-home"
      >
        <template #text>
          <i-bi-house-fill />
          <span>
            {{
              $t("Collection de {username}", {
                username: publicCollectionUsername,
              })
            }}
          </span>
        </template>
        <template #items>
          <NavigationItem>
            <router-link :to="`/bookcase/show/${publicCollectionUsername}`">
              <i-bi-book-half />
              {{ $t("Bibliothèque") }}
            </router-link>
          </NavigationItem>
          <NavigationItem>
            <router-link :to="`/collection/user/${publicCollectionUsername}`">
              <i-bi-list /> {{ $t("Collection") }}</router-link
            >
          </NavigationItem>
        </template>
      </NavigationItemGroup>
    </template>
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
import Cookies from "js-cookie";

const route = useRoute();

const { user } = storeToRefs(collection());
const { getImagePath } = images();

const username = $computed(() => user.value?.username || null);

const publicCollectionUsername = $computed(
  () => route.params.username as string | undefined,
);

const logout = () => {
  Cookies.remove("token");
  sessionStorage.clear();
  user.value = null;
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

  svg {
    margin-right: 0.5rem;
  }

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

  &.active > a > *,
  a.router-link-active {
    color: #c88964 !important;
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

  &.no-icon {
    padding-left: 10px;
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
