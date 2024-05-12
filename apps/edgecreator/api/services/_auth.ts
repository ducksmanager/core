import { Request, Response } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";

import { getSvgPath } from "~/_utils";
import { User } from "~types/SessionUser";

export const getUserCredentials = (user: User) => ({
  "x-dm-user": user.username,
  "x-dm-pass": user.hashedPassword,
});


export const checkUserIsAdminForExportOrIsEditorForSaveOrIsFirstFileForModel = (
  req: Request,
  res: Response,
  next: CallableFunction,
) => {
  const { runExport, country, magazine, issuenumber } = req.body as {
    runExport: boolean;
    country: string;
    magazine: string;
    issuenumber: string;
  };
  const svgPath = getSvgPath(runExport, country, magazine, issuenumber);
  const fileAlreadyExists = fs.existsSync(svgPath);
  const user = req.user;
  if (
    !(
      user?.privileges.EdgeCreator === "Admin" ||
      ((user?.privileges.EdgeCreator === "Edition" ||
        !fileAlreadyExists) /* Initial photo upload (viewer role is enough for that) */ &&
        !runExport)
    )
  ) {
    return res.sendStatus(403);
  }
  next();
};

export const checkUserIsAdminOrEditor = (
  req: Request,
  res: Response,
  next: CallableFunction,
) => {
  const user = req.user;
  if (!(user && ["Admin", "Edition"].includes(user.privileges.EdgeCreator))) {
    return res.sendStatus(403);
  }
  next();
};

export const injectTokenIfValid = (
  req: Request,
  _: Response,
  next: CallableFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (token == null) {
    next();
  } else {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET!,
      (err: unknown, user: unknown) => {
        if (user) {
          req.user = user as User;
        } else {
          console.log(`Invalid token: ${err as string}`);
        }
        next();
      },
    );
  }
};
