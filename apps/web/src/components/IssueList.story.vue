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

import type { issue } from "~prisma-schemas/schemas/dm";

const customIssues: issue[] = [
  {
    id: 167808,
    publicationcode: "fr/MP",
    issuecode: "fr/MP 303",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 304",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 307",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 313",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 314",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 316",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 317",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 386",
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
    publicationcode: "fr/MP",
    issuecode: "fr/MP 387",
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
