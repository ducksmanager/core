import { PrismaClient } from "~prisma_clients/client_dm";

const computePublicationcode = {
  publicationcode: {
    needs: {
      country: true,
      magazine: true,
    },
    compute: ({ country, magazine }: { country: string; magazine: string }) =>
      `${country}/(${magazine})`,
  },
};

const prisma = new PrismaClient().$extends({
  result: {
    issue: computePublicationcode,
    subscription: computePublicationcode,
  },
});

export default prisma;
