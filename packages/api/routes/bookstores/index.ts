import bodyParser from "body-parser";

import BookstoreSuggested from "~/emails/bookstore-suggested";
import { prismaDm } from "~/prisma";
import { SimpleBookstore } from "~dm-types/SimpleBookstore";
import { bookstore, bookstoreComment } from "~prisma-schemas/client_dm";
import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();

export const get = async (
  ...[, res]: ExpressCall<{ resBody: SimpleBookstore[] }>
) => res.json(await getActiveBookstores());

const getActiveBookstores = async () =>
  await prismaDm.bookstore.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      coordX: true,
      coordY: true,
      comments: {
        where: {
          isActive: true,
        },
      },
    },
    where: {
      comments: {
        some: {
          isActive: true,
        },
      },
    },
  });

export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: bookstoreComment;
      reqBody: { id?: string; bookstore: SimpleBookstore };
    }>
  ) => {
    const { bookstore } = req.body;
    const {
      name,
      address,
      coordX: coordXParam,
      coordY: coordYParam,
      comments,
    } = bookstore;
    const id = req.body.id;
    const coordX = coordXParam;
    const coordY = coordYParam;
    if (!id && !name) {
      res.writeHead(400);
      res.end("No bookstore ID or name was provided");
      return;
    }
    let dbBookstore: bookstore;
    if (id) {
      try {
        dbBookstore = await prismaDm.bookstore.findUniqueOrThrow({
          where: { id: parseInt(id) },
        });
      } catch (e) {
        res.writeHead(400);
        res.end(`No bookstore exists with ID ${id}`);
        return;
      }
    } else {
      dbBookstore = await prismaDm.bookstore.create({
        data: {
          name,
          address,
          coordX,
          coordY,
        },
      });
    }
    const user = req.user?.id
      ? await prismaDm.user.findUnique({
          where: {
            id: req.user.id,
          },
        })
      : null;
    const createdComment = await prismaDm.bookstoreComment.create({
      data: {
        bookstoreId: dbBookstore.id,
        isActive: false,
        userId: user?.id,
        comment: comments[comments.length - 1].comment,
      },
    });

    new BookstoreSuggested({
      user
    }).send();

    return res.json(createdComment);
  },
];
