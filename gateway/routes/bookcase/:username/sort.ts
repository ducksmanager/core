import { Handler } from "express";

import { PrismaClient } from "../../../prisma/generated/client_dm";
import { checkValidBookcaseUser } from "./index";

const prisma = new PrismaClient();

const getLastPublicationPosition = async (userId: number) =>
  (
    await prisma.bookcasePublicationOrder.aggregate({
      _max: { order: true },
      where: { userId },
    })
  )._max.order || -1;

export const get: Handler = async (req, res) => {
  const user = await checkValidBookcaseUser(req, res);
  if (user === null) {
    return;
  } else {
    const userId = user.id;
    let maxSort = await getLastPublicationPosition(userId);
    const userSortedPublicationcodes = (
      await prisma.bookcasePublicationOrder.findMany({
        select: { publicationcode: true },
        where: { userId },
      })
    ).map(({ publicationcode }) => publicationcode);
    const userPublicationcodes = await prisma.issue.findMany({
      select: {
        country: true,
        magazine: true,
      },
      distinct: ["country", "magazine"],
      where: { userId },
      orderBy: {
        country: "asc",
        magazine: "asc",
      },
    });
    const missingPublicationCodesInOrder = userPublicationcodes
      .map(({ country, magazine }) => `${country}/${magazine}`)
      .filter(
        (publicationcode) =>
          !userSortedPublicationcodes.includes(publicationcode)
      );

    const insertOperations = missingPublicationCodesInOrder.map(
      (publicationcode) =>
        prisma.bookcasePublicationOrder.create({
          data: {
            publicationcode,
            order: ++maxSort,
            userId,
          },
        })
    );
    await prisma.$transaction(insertOperations);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        (
          await prisma.bookcasePublicationOrder.findMany({
            select: { publicationcode: true },
            where: { userId },
            orderBy: { publicationcode: "asc" },
          })
        ).map(({ publicationcode }) => publicationcode)
      )
    );
  }
};
