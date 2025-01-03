import crypto from "crypto";
import type { Request, Response } from "express";
import fs from "fs";
import { decode } from "node-base64-image";
import { dirname } from "path";

import { getUserCredentials } from "../_auth";
import {
  ClientEvents as EdgeCreatorServices,
  endpoint as edgeCreatorServicesEndpoint,
} from "~dm-services/edgecreator";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { SocketClient } from "~socket.io-client-services";

import { getNextAvailableFile } from "../_upload_utils";
import { useSocketServices } from "~socket.io-services/index";

const edgesPath: string = process.env.EDGES_PATH!;

const getEdgeCreatorServices = () =>
  new SocketClient(
    process.env.DM_SOCKET_URL!
  ).addNamespace<EdgeCreatorServices>(edgeCreatorServicesEndpoint).services;

const listenEvents = () => ({
  uploadFromBase64: async (parameters: { data: string; issuecode: string }) => {
    const { issuecode, data } = parameters;
    const { publicationcode, issuenumber } =
      await prismaCoa.inducks_issue.findFirstOrThrow({
        where: { issuecode },
      });
    const [countrycode, magazinecode] = publicationcode.split("/");
    const path = `${edgesPath}/${countrycode}/photos`;
    const tentativeFileName = `${magazinecode}.${issuenumber}.photo`;
    const fileName = getNextAvailableFile(
      `${path}/${tentativeFileName}`,
      "jpg"
    ).match(/\/([^/]+)$/)![1];

    await decode(data, {
      fname: `${path}/${fileName.replace(/.jpg$/, "")}`,
      ext: "jpg",
    });

    await getEdgeCreatorServices().sendNewEdgePhotoEmail(issuecode);

    return { fileName };
  },
});



export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { token: string }
>("/save", {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];

export const upload = async (
  req: Request<
    Record<string, never>,
    {
      photo: boolean;
      multiple: boolean;
      edge: {
        country: string;
        magazine: string;
        issuenumber: string;
      };
    }
  >,
  res: Response
) => {
  const userCredentials = getUserCredentials(req.user!);

  let allowedMimeTypes: string[];

  const { photo: isEdgePhoto, multiple: isMultipleEdgePhoto, edge } = req.body;
  const files = req.files! as Express.Multer.File[];
  const targetFilesnames = [];
  for (const {
    originalname: filename,
    mimetype: mimetype,
    path: temporaryPath,
  } of files) {
    allowedMimeTypes = isEdgePhoto
      ? ["image/jpg", "image/jpeg"]
      : ["image/png"];

    const targetFilename = await getTargetFilename(
      filename,
      isMultipleEdgePhoto,
      edge,
      isEdgePhoto
    );
    try {
      const { hash } = await validateUpload(
        mimetype,
        targetFilename,
        allowedMimeTypes,
        isEdgePhoto,
        userCredentials,
        edge,
        temporaryPath
      );
      saveFile(temporaryPath, targetFilename);
      await storePhotoHash(targetFilename, hash);
      targetFilesnames.push(
        targetFilename.replace(
          process.env.EDGES_PATH!,
          process.env.VITE_EDGES_URL!
        )
      );
    } catch (e: unknown) {
      res.writeHead(400, {
        Connection: "close",
        "Content-Type": "application/json",
      });
      res.end((e as Error).message);
    }
  }
  res.writeHead(200, { Connection: "close" });
  return res.json(targetFilesnames.map((fileName) => ({ fileName })));
};

const getTargetFilename = async (
  filename: string,
  isMultipleEdgePhoto: boolean,
  issuecode: string,
  isEdgePhoto: boolean
) => {
  filename = filename.normalize("NFD").replace(/[\u0300-\u036F]/g, "");

  if (isMultipleEdgePhoto) {
    return getNextAvailableFile(
      `${edgesPath}/tranches_multiples/photo.multiple`,
      "jpg"
    );
  } else {
    const { publicationcode, issuenumber } =
      await prismaCoa.inducks_issue.findFirstOrThrow({
        where: { issuecode },
      });
    const [countrycode, magazinecode] = publicationcode.split("/");
    if (isEdgePhoto) {
      return getNextAvailableFile(
        `${edgesPath}/${countrycode}/photos/${magazinecode}.${issuenumber}.photo`,
        "jpg"
      );
    } else {
      return `${edgesPath}/${countrycode}/elements/${
        filename.includes(magazinecode)
          ? filename
          : `${magazinecode}.${filename}`
      }`;
    }
  }
};

const validateUpload = async (
  mimetype: string,
  filename: string,
  allowedMimeTypes: string[],
  isEdgePhoto: boolean,
  userCredentials: Record<string, string>,
  issuecode: string,
  filePath: string
): Promise<{ hash: string }> => {
  if (!allowedMimeTypes.includes(mimetype)) {
    throw new Error(
      JSON.stringify({
        error:
          "Invalid file type: {mimetype}, the following types are allowed: {allowedMimeTypes}",
        placeholders: { mimetype, allowedMimeTypes },
      })
    );
  }
  const { hash } = readContentsAndCalculateHash(filePath);
  if (isEdgePhoto) {
    if (await hasReachedDailyUploadLimit()) {
      throw new Error(
        JSON.stringify({
          error: "You have reached your daily upload limit",
        })
      );
    }
    if (await hasAlreadySentPhoto(hash)) {
      throw new Error(
        JSON.stringify({ error: "You have already sent this photo" })
      );
    }
  } else {
    // await readFile(filestream);
    const otherElementUses = await getFilenameUsagesInOtherModels(
      filename,
      issuecode
    );
    if (fs.existsSync(filename) && otherElementUses.length) {
      throw new Error(
        JSON.stringify({
          error:
            "This file name is already used in other models, please rename your file",
          placeholders: {
            otherElementUses: JSON.stringify(otherElementUses),
          },
        })
      );
    }
  }
  return { hash };
};

const hasReachedDailyUploadLimit = async () =>
  (await getEdgeCreatorServices().checkTodayLimit()).uploadedFilesToday.length > 10;

const hasAlreadySentPhoto = async (hash: string) =>
  (await getEdgeCreatorServices().getImageByHash(hash)) === null;

const readContentsAndCalculateHash = (
  fileName: string
): { contents: Buffer; hash: string } => {
  const fileBuffer = fs.readFileSync(fileName);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);

  return { contents: fileBuffer, hash: hashSum.digest("hex") };
};

const getFilenameUsagesInOtherModels = async (
  filename: string,
  currentIssuecode: string
) =>
  (await getEdgeCreatorServices().getImagesFromFilename(filename)).filter(
    (otherUse) => currentIssuecode !== otherUse.issuenumberStart
  );

const saveFile = (temporaryPath: string, finalPath: string) => {
  fs.mkdirSync(dirname(finalPath), { recursive: true });
  fs.renameSync(temporaryPath, finalPath);
};

const storePhotoHash = async (filename: string, hash: string) => {
  await getEdgeCreatorServices().createElementImage(hash, filename);
};
