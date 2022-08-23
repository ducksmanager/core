import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "../../prisma/generated/client_dm";
import { authenticateToken } from "../login";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();
export const post = [
  authenticateToken,
  parseForm,
  (async (req, res) => {
    const sorts = req.body.sorts;
    if (sorts.length) {
      const userId = req.user.id;
      console.log(userId);
      await prisma.bookcasePublicationOrder.deleteMany({
        where: { userId: userId },
      });
      let order = 0;
      const insertOperations = sorts.map((publicationcode: string) =>
        prisma.bookcasePublicationOrder.create({
          data: {
            publicationcode,
            order: order++,
            userId,
          },
        })
      );
      await prisma.$transaction(insertOperations);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ max: order - 1 }));
    }
  }) as Handler,
];
