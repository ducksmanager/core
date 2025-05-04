// noinspection ES6PreferShortImport
import { Prisma } from "~prisma-schemas/client_dm";
const simpleUserValidator = Prisma.validator<Prisma.userDefaultArgs>()({
  select: {
    id: true,
    username: true,
    presentationText: true,
    allowSharing: true,
  },
});

export type SimpleUserWithQuickStats = Omit<
  Prisma.userGetPayload<typeof simpleUserValidator> & {
    numberOfCountries: number;
    numberOfPublications: number;
    numberOfIssues: number;
    okForExchanges: boolean;
  },
  "id"
> & { userId: number };
