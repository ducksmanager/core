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
const items = $computed(
  () =>
    [
      {
        route: "/collection/show/[...all]",
        text:
          total.value === undefined
            ? $t("Mes numéros")
            : $t("Mes numéros ({0})", [total.value]),
      },
      {
        route: "/collection/duplicates",
        text:
          total.value === undefined
            ? $t("Mes numéros en double")
            : $t("Mes numéros en double ({0})", [
                total.value - totalUniqueIssues.value,
              ]),
      },
      {
        route: "/collection/to-read",
        text: !issuesInToReadStack.value
          ? $t("Mes numéros à lire")
          : $t("Mes numéros à lire ({0})", [issuesInToReadStack.value.length]),
      },
      {
        route: "/collection/on-sale",
        text: !issuesInOnSaleStack.value
          ? $t("Mes numéros à vendre")
          : $t("Mes numéros à vendre ({0})", [
              issuesInOnSaleStack.value.length,
            ]),
      },
      {
        route: "/collection/subscriptions",
        text:
          subscriptions.value == undefined
            ? $t("Mes abonnements")
            : $t("Mes abonnements ({0})", [subscriptions.value.length]),
      },
      {
        route: "/collection/account",
        text: $t("Mon compte"),
        disabled: user.value?.username === "demo",
      },
    ] as const,
);

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
