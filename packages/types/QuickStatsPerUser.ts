import type { Prisma } from "~prisma-schemas/schemas/dm";

export type QuickStatsPerUser = Record<
  string,
  Prisma.userGetPayload<{
    select: {
      id: true;
      username: true;
      presentationText: true;
      allowSharing: true;
    };
  }> & {
    numberOfCountries: number;
    numberOfPublications: number;
    numberOfIssues: number;
    okForExchanges: boolean;
  }
>;
