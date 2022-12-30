import { Prisma } from "~prisma_clients/client_dm";
const simpleUserValidator = Prisma.validator<Prisma.userArgs>()({
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
  },
  "id"
> & { userId: number };
