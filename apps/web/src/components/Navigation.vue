<template>
  <ul id="menu-content" class="menu-content collapse show">
    <li v-for="item in items" :key="item.title">
      <router-link v-if="'route' in item" :to="item.route">
        <i v-if="'icon' in item" :class="item.icon" />{{
          item.title
        }}</router-link
      >
      <template v-else>
        <span :v-b-toggle="item.title">
          {{ item.title }}
        </span>
        <b-collapse :id="item.title" :model-value="true">
          <ul class="sub-menu">
            <li v-for="subItem in item.items" :key="subItem.title">
              <router-link v-if="'route' in subItem" :to="subItem.route">
                <i v-if="'icon' in subItem" :class="subItem.icon" />
                <div
                  class="b-custom"
                  :style="{
                    backgroundImage: `url(${getImagePath('icons/inducks.png')})`,
                  }"
                />
                {{ subItem.title }}</router-link
              >
              <span v-else @click="subItem.onClick">{{ subItem.title }}</span>
            </li>
          </ul>
        </b-collapse>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const { t: $t } = useI18n();

const { user } = storeToRefs(collection());
const { getImagePath } = images();

const username = $computed(() => user.value?.username || null);

const publicCollectionUsername = $computed(
  () => route.query.username as string | undefined,
);

const collectionMenu = computed(() =>
  username === undefined
    ? undefined
    : ({
        title: $t("Collection"),
        icon: "glyphicon-home",
        items: username
          ? [
              {
                title: $t("Ma bibliothèque"),
                route: router.resolve({
                  name: "/bookcase/show/[[username]]",
                  params: { username: undefined },
                }),
                icon: "glyphicon-book-half",
              },
              {
                title: $t("Ma collection"),
                route: "/collection/show",
                icon: IBiList,
              },
              {
                title: $t("Statistiques de ma collection"),
                route: "/stats/general",
                icon: "glyphicon-graph-up",
              },
              {
                title: $t("Agrandir ma collection"),
                route: "/expand/suggestions",
                icon: "glyphicon-capslock-fill",
              },
              {
                title: $t("Collection Inducks"),
                route: "/inducks/import",
                icon: "glyphicon-book",
              },
              {
                title: $t("Imprimer ma collection"),
                route: "/print",
                icon: "glyphicon-printer-fill",
              },
              {
                title: $t("Déconnexion"),
                onClick: logout,
                icon: "glyphicon-x-square-fill",
              },
            ]
          : [
              {
                title: $t("Inscription"),
                route: "/signup",
                icon: "glyphicon-certificate",
              },
              {
                title: $t("Connexion"),
                route: "/login",
                icon: "glyphicon-folder-open",
              },
            ],
      } as const),
);

const publicCollectionMenu = computed(() =>
  !publicCollectionUsername
    ? undefined
    : ({
        title: $t("Collection de {username}", {
          username: publicCollectionUsername,
        }),
        icon: "glyphicon-home",
        items: [
          {
            title: $t("Bibliothèque"),
            route: router.resolve({
              name: "/bookcase/show/[[username]]",
              params: { username: publicCollectionUsername },
            }),
            icon: "glyphicon-book-half",
          },
          {
            title: $t("Collection"),
            route: router.resolve({
              name: "/collection/user/[username]/[...all]",
              params: { username: publicCollectionUsername, all: "" },
            }),
            icon: "glyphicon-list",
          },
        ],
      } as const),
);

const otherItems = computed(() =>
  username
    ? []
    : ([
        {
          title: $t("Vous possédez une collection Inducks ?"),
          route: "/inducks/import",
          icon: "glyphicon-book",
        },
        {
          title: $t("Une petite démo ?"),
          route: "/demo",
          icon: "glyphicon-demo",
        },
        {
          title: $t("Trouver des bouquineries"),
          route: "/bookstores",
          icon: "glyphicon-bookstore",
        },
      ] as const),
);

const items = computed(() =>
  [
    collectionMenu.value,
    publicCollectionMenu.value,
    ...otherItems.value,
  ].filter((item) => item !== undefined),
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
