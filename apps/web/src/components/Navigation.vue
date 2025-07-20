<template>
  <NavigationMenu v-if="collectionMenu" :menu="collectionMenu" />
  <NavigationMenu v-if="publicCollectionMenu" :menu="publicCollectionMenu" />
  <NavigationItem
    v-for="item in otherItems"
    :key="item.title"
    :is-in-sub-menu="false"
    :item="item"
  />
</template>

<script setup lang="ts">
import Cookies from "js-cookie";
import { useI18n } from "vue-i18n";
import IBiBinocularsFill from "~icons/bi/binoculars-fill";
import IBiBookHalf from "~icons/bi/book-half";
import IBiCapslockFill from "~icons/bi/capslock-fill";
import IBiGraphUp from "~icons/bi/graph-up";
import IBiHouseFill from "~icons/bi/house-fill";
import IBiList from "~icons/bi/list";
import IBiPrinterFill from "~icons/bi/printer-fill";
import IBiShop from "~icons/bi/shop";
import IBiXSquareFill from "~icons/bi/x-square-fill";
import ICoaFoot from "~icons/extra-icons/coafoot";
import NavigationMenu from "./NavigationMenu.vue";

const route = useRoute();
const router = useRouter();
const { t: $t } = useI18n();

const { user } = storeToRefs(collection());

const username = $computed(() => user.value?.username || null);

const publicCollectionUsername = $computed(() =>
  "username" in route.params ? (route.params.username as string) : undefined,
);

const collectionMenu = computed(() =>
  username === undefined
    ? undefined
    : ({
        title: $t("Collection"),
        icon: IBiHouseFill,
        items: username
          ? [
              {
                title: $t("Ma bibliothèque"),
                route: router.resolve("/bookcase/show"),
                icon: IBiBookHalf,
              },
              {
                title: $t("Gérer ma collection"),
                route: router.resolve({
                  name: "/collection/show/[...all]",
                  params: {
                    all: "_",
                  },
                }),
                icon: IBiList,
              },
              {
                title: $t("Statistiques de ma collection"),
                route: router.resolve("/stats"),
                icon: IBiGraphUp,
              },
              {
                title: $t("Agrandir ma collection"),
                route: router.resolve("/expand"),
                icon: IBiCapslockFill,
              },
              {
                title: $t("Collection Inducks"),
                route: router.resolve("/inducks-import"),
                icon: ICoaFoot,
              },
              {
                title: $t("Imprimer ma collection"),
                route: router.resolve("/print"),
                icon: IBiPrinterFill,
              },
              {
                title: $t("Déconnexion"),
                onClick: logout,
                icon: IBiXSquareFill,
              },
            ]
          : [
              {
                title: $t("Inscription"),
                route: router.resolve("/signup"),
              },
              {
                title: $t("Connexion"),
                route: router.resolve("/login"),
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
        icon: IBiHouseFill,
        items: [
          {
            title: $t("Bibliothèque"),
            route: router.resolve(`/bookcase/show/${publicCollectionUsername}`),
            icon: IBiBookHalf,
          },
          {
            title: $t("Collection"),
            route: router.resolve(
              `/collection/user/${publicCollectionUsername}`,
            ),
            icon: IBiList,
          },
        ],
      } as const),
);

const otherItems = computed(
  () =>
    [
      {
        title: $t("Trouver des bouquineries"),
        route: router.resolve("/bookstores/"),
        icon: IBiShop,
      },
      ...(username
        ? []
        : [
            {
              title: $t("Une petite démo ?"),
              route: router.resolve("/demo"),
              icon: IBiBinocularsFill,
            },
            {
              title: $t("Vous possédez une collection Inducks ?"),
              route: router.resolve("/inducks/import"),
              icon: ICoaFoot,
            },
          ]),
    ] as const,
);

const logout = () => {
  Cookies.remove("token");
  sessionStorage.clear();
  user.value = null;
};
</script>
