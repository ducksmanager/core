import prismaDm from "~prisma-schemas/extended/dm.extends";
import { ExpressCall } from "~routes/_express-call";

import { checkValidBookcaseUser } from ".";

const getLastPublicationPosition = async (userId: number) =>
  (
    await prismaDm.bookcasePublicationOrder.aggregate({
      _max: { order: true },
      where: { userId },
    })
  )._max.order || -1;
export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: string[];
    params: { username: string };
  }>
) => {
  const user = await checkValidBookcaseUser(req.user, req.params.username);
  if (user === null) {
    return;
  } else {
    const userId = user.id;
    let maxSort = await getLastPublicationPosition(userId);
    const userSortedPublicationcodes = (
      await prismaDm.bookcasePublicationOrder.findMany({
        select: { publicationcode: true },
        where: { userId },
      })
    ).map(({ publicationcode }) => publicationcode);
    const userPublicationcodes = (
      await prismaDm.issue.findMany({
        select: {
          publicationcode: true,
        },
        distinct: ["country", "magazine"],
        where: { userId },
        orderBy: [{ country: "asc" }, { magazine: "asc" }],
      })
    ).map(({ publicationcode }) => publicationcode);

    const missingPublicationCodesInOrder = userPublicationcodes.filter(
      (publicationcode) => !userSortedPublicationcodes.includes(publicationcode)
    );
    const obsoletePublicationCodesInOrder = userSortedPublicationcodes.filter(
      (publicationcode) => !userPublicationcodes.includes(publicationcode)
    );

    const insertOperations = missingPublicationCodesInOrder.map(
      (publicationcode) =>
        prismaDm.bookcasePublicationOrder.create({
          data: {
            publicationcode,
            order: ++maxSort,
            userId,
          },
        })
    );
    await prismaDm.$transaction(insertOperations);

    const deleteOperations = obsoletePublicationCodesInOrder.map(
      (publicationcode) =>
        prismaDm.bookcasePublicationOrder.delete({
          where: { userId_publicationcode: { publicationcode, userId } },
        })
    );
    await prismaDm.$transaction(deleteOperations);

    return res.json(
      (
        await prismaDm.bookcasePublicationOrder.findMany({
          select: { publicationcode: true },
          where: { userId },
          orderBy: { order: "asc" },
        })
      ).map(({ publicationcode }) => publicationcode)
    );
  }
};
