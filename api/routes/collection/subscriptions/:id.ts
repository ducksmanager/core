import bodyParser from "body-parser";
import { Handler, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

import { put } from "./index";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export type postType = void;
export const post = [
  parseForm,
  (async (req, res: Response<postType>, next) => {
    await put[0](req, res, next);
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  }) as Handler,
];

export type delType = void;
export const del = [
  parseForm,
  (async (req, res: Response<delType>) => {
    await prisma.subscription.deleteMany({
      where: {
        id: parseInt(req.params.id) || -1,
        users: {
          id: req.user.id,
        },
      },
    });
    res.writeHead(204);
    res.end();
  }) as Handler,
];
