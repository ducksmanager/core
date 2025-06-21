<template>
  <Menu
    v-if="user"
    :title="$t('Gérer ma collection')"
    root-path="/collection"
    default-path="/show"
    :items="items"
  />
</template>

<script setup lang="ts">
const { loadSubscriptions } = collection();

const {
  subscriptions,
  issuesInToReadStack,
  issuesInOnSaleStack,
  total,
  totalUniqueIssues,
  user,
} = storeToRefs(collection());

const { t: $t } = useI18n();
const router = useRouter();
const items = $computed(() => [
  {
    path: "/show",
    text:
      total.value === undefined
        ? $t("Mes numéros")
        : $t("Mes numéros ({0})", [total.value]),
  },
  {
    path: "/duplicates",
    text:
      total.value === undefined
        ? $t("Mes numéros en double")
        : $t("Mes numéros en double ({0})", [
            total.value - totalUniqueIssues.value,
          ]),
  },
  {
    path: "/to-read",
    text: !issuesInToReadStack.value
      ? $t("Mes numéros à lire")
      : $t("Mes numéros à lire ({0})", [issuesInToReadStack.value.length]),
  },
  {
    path: "/on-sale",
    text: !issuesInOnSaleStack.value
      ? $t("Mes numéros à vendre")
      : $t("Mes numéros à vendre ({0})", [issuesInOnSaleStack.value.length]),
  },
  {
    path: "/subscriptions",
    text:
      subscriptions.value == undefined
        ? $t("Mes abonnements")
        : $t("Mes abonnements ({0})", [subscriptions.value.length]),
  },
  {
    path: "/account",
    text: $t("Mon compte"),
    disabled: user.value?.username === "demo",
  },
]);

watch(
  user,
  (newValue) => {
    if (newValue) {
      loadSubscriptions();
    } else if (newValue === null) {
      router.push("/login");
    }
  },
  { immediate: true },
);
</script>
