import { Prisma } from "~prisma-schemas/schemas/dm";
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
  Prisma.userGetPayload<typeof simpleUserValidator> & {
    numberOfCountries: number;
    numberOfPublications: number;
    numberOfIssues: number;
    okForExchanges: boolean;
  }
>;
