import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "../../../prisma/generated/client_dm";
import { put } from "./index";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export const post = [
  parseForm,
  (async (req, res, next) => {
    await put[0](req, res, next);
    res.writeHead(200);
    res.end();
  }) as Handler,
];

export const del = [
  parseForm,
  (async (req, res) => {
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
