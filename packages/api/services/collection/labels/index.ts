import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm";

import type { UserServices } from "../../../index";

export const getUserLabel = async (description: string, userId: number) =>
  prismaDm.label.findUnique({
    where: {
      description_userId: {
        description,
      userId,
    }
  }});

export default ({ _socket }: UserServices) => ({
  getLabels: () =>
    prismaDm.label.findMany({
      where: { OR: [{ userId: null }, { userId: _socket.data.user.id }] },
      orderBy: {
        description: "asc",
      },
    }),

  createLabel: async (description: string) => {
    const criteria = {
      userId: _socket.data.user.id,
      description,
    };
    if (
      (await prismaDm.label.count({
        where: {
          OR: [{ userId: null, description }, criteria],
          description,
        },
      })) > 0
    ) {
      return { error: "Label already exists" } as const;
    }

    await prismaDm.label.create({
      data: criteria,
    });
  },

  deleteLabel: async (labelDescription: string) => {
    const criteria = {
      userId: _socket.data.user.id,
      description: labelDescription,
    };
    const label = await getUserLabel(criteria.description, criteria.userId);
    if (!label) {
      return { error: "Label not found" };
    }
    await prismaDm.label.delete({
      where: {
        description_userId: criteria,
      },
    });
  },
});
