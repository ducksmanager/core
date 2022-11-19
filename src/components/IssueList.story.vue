<template>
  <Story>
    <Variant title="Custom issues on sale by others">
      <issue-list
        publicationcode="fr/MP"
        :custom-issues="customIssues"
        :group-user-copies="false"
        on-sale-by-others
      />
    </Variant>
  </Story>
</template>

<script lang="ts" setup>
import IssueList from "./IssueList.vue";

const customIssues = [
  {
    id: 167808,
    country: "fr",
    magazine: "MP",
    issueNumber: "303",
    condition: "moyen",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1348,
    creationDate: "2017-02-10T14:31:02.000Z",
  },
  {
    id: 167809,
    country: "fr",
    magazine: "MP",
    issueNumber: "304",
    condition: "moyen",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1348,
    creationDate: "2017-02-10T14:31:02.000Z",
  },
  {
    id: 167812,
    country: "fr",
    magazine: "MP",
    issueNumber: "307",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1348,
    creationDate: "2017-02-10T14:31:02.000Z",
  },
  {
    id: 167818,
    country: "fr",
    magazine: "MP",
    issueNumber: "313",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1348,
    creationDate: "2017-02-10T14:31:02.000Z",
  },
  {
    id: 167819,
    country: "fr",
    magazine: "MP",
    issueNumber: "314",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1348,
    creationDate: "2017-02-10T14:31:02.000Z",
  },
  {
    id: 167821,
    country: "fr",
    magazine: "MP",
    issueNumber: "316",
    condition: "moyen",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1348,
    creationDate: "2017-02-10T14:31:02.000Z",
  },
  {
    id: 167822,
    country: "fr",
    magazine: "MP",
    issueNumber: "317",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1348,
    creationDate: "2017-02-10T14:31:02.000Z",
  },
  {
    id: 385707,
    country: "fr",
    magazine: "MP",
    issueNumber: "386",
    condition: "bon",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1073,
    creationDate: "2022-01-08T09:54:39.000Z",
  },
  {
    id: 385715,
    country: "fr",
    magazine: "MP",
    issueNumber: "387",
    condition: "bon",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: 0,
    userId: 1861,
    creationDate: "2022-01-08T12:13:40.000Z",
  },
];
</script>

<style scoped>

</style>
