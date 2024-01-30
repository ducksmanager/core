import { Prisma } from "~prisma-clients/client_dm";
const simpleUserValidator = Prisma.validator<Prisma.userDefaultArgs>()({
  select: {
    id: true,
    username: true,
    presentationText: true,
    allowSharing: true,
  },
});

export type QuickStatsPerUser = Record<
  string,
  Omit<
    Prisma.userGetPayload<typeof simpleUserValidator> & {
      numberOfCountries: number;
      numberOfPublications: number;
      numberOfIssues: number;
      okForExchanges: boolean;
    },
    "id"
  > & { userId: number }
>;
