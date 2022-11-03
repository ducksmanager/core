<template>
  <b-alert show variant="info"
    >{{
      $t(
        "Cette page indique les numéros que d'autres utilisateurs sur DucksManager proposent à la vente. Cliquez sur le ou les numéros qui vous intéressent,"
      )
    }}
    <span v-if="isTouchScreen">{{
      $t("puis faites un appui long pour contacter le vendeur.")
    }}</span>
    <span v-else>{{
      $t("puis faites un clic droit pour contacter le vendeur.")
    }}</span>
    <div>
      {{ $t("Les messages sont envoyés aux vendeurs une fois par jour.") }}
    </div>
  </b-alert>
  <div v-if="issuesOnSaleByOthers && hasPublicationNames">
    <b-alert
      v-if="!Object.keys(issuesOnSaleByOthers).length"
      show
      variant="info"
    >
      {{
        $t(
          "Aucun numéro que vous ne possédez pas n'est en vente parmi les magazines que vous avez surveillés"
        )
      }}
    </b-alert>
    <span v-else>
      {{ $t("Montrer les magazines en vente par") }}
      <BFormSelect v-model="userIdFilter" size="sm">
        <b-form-select-option :key="null" :value="null">
          {{ $t("Tous les utilisateurs") }}
        </b-form-select-option>
        <b-form-select-option
          v-for="{ text, value } in sellingUserNames"
          :key="value"
          :value="value"
        >
          {{ text }}
        </b-form-select-option>
      </BFormSelect>
    </span>
    <IssueList
      v-for="(issues, publicationcode) in issuesOnSaleByOthers"
      :key="publicationcode"
      :publicationcode="publicationcode"
      :custom-issues="
        userIdFilter
          ? issues.filter(({ userId }) => userId === userIdFilter)
          : issues
      "
      owned-only
      on-sale-by-others
      ><template #onSaleByOther="{ userId }">
        <span class="d-inline-block me-2"
          >{{ $t("En vente par") }}
          <UserPopover
            id
            :points="points[userId]"
            :stats="stats[userId]" /></span></template
    ></IssueList>
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup>
import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { users } from "~/stores/users";

const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
const issuesOnSaleByOthers = $computed(() => collection().issuesOnSaleByOthers);
const stats = $computed(() => users().stats);
const points = $computed(() => users().points);

let hasPublicationNames = $ref(false);
let userIdFilter = $ref(null);
let sellingUserNames = $ref([]);

onMounted(async () => {
  await collection().loadIssuesOnSaleByOthers();
  const sellingUserIds = [
    ...new Set(
      Object.values(issuesOnSaleByOthers).reduce(
        (acc, issues) => [...acc, ...issues.map((issue) => issue.userId)],
        []
      )
    ),
  ];
  await users().fetchStats(sellingUserIds);
  sellingUserNames = sellingUserIds
    .reduce(
      (acc, userId) => [
        ...acc,
        { value: userId, text: stats[userId].username },
      ],
      []
    )
    .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2));
  await coa().fetchPublicationNames(Object.keys(issuesOnSaleByOthers));
  hasPublicationNames = true;
});
</script>

<style scoped lang="scss">
</style>
