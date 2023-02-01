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
import dayjs from "dayjs";

import { IssueWithPublicationcode } from "~/stores/collection";

import IssueList from "./IssueList.vue";

const customIssues: IssueWithPublicationcode[] = [
  {
    id: 167808,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "303",
    condition: "moyen",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1348,
    creationDate: dayjs("2017-02-10T14:31:02.000Z").toDate(),
  },
  {
    id: 167809,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "304",
    condition: "moyen",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1348,
    creationDate: dayjs("2017-02-10T14:31:02.000Z").toDate(),
  },
  {
    id: 167812,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "307",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1348,
    creationDate: dayjs("2017-02-10T14:31:02.000Z").toDate(),
  },
  {
    id: 167818,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "313",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1348,
    creationDate: dayjs("2017-02-10T14:31:02.000Z").toDate(),
  },
  {
    id: 167819,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "314",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1348,
    creationDate: dayjs("2017-02-10T14:31:02.000Z").toDate(),
  },
  {
    id: 167821,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "316",
    condition: "moyen",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1348,
    creationDate: dayjs("2017-02-10T14:31:02.000Z").toDate(),
  },
  {
    id: 167822,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "317",
    condition: "mauvais",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1348,
    creationDate: dayjs("2017-02-10T14:31:02.000Z").toDate(),
  },
  {
    id: 385707,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "386",
    condition: "bon",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1073,
    creationDate: dayjs("2022-01-08T09:54:39.000Z").toDate(),
  },
  {
    id: 385715,
    country: "fr",
    magazine: "MP",
    publicationcode: "fr/MP",
    issuenumber: "387",
    condition: "bon",
    purchaseId: -1,
    isOnSale: true,
    isToRead: false,
    isSubscription: false,
    userId: 1861,
    creationDate: dayjs("2022-01-08T12:13:40.000Z").toDate(),
  },
];
</script>

<style scoped></style>
