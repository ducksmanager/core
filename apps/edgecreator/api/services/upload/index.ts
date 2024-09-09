import crypto from "crypto";
import type { Request, Response } from "express";
import fs from "fs";
import { decode } from "node-base64-image";
import { dirname } from "path";
import type { Namespace, Server } from "socket.io";

import { getUserCredentials } from "~/services/_auth";
import EdgeCreatorServices from "~dm-services/edgecreator/types";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import type { EventCalls } from "~socket.io-client-services";
import { SocketClient } from "~socket.io-client-services";

import { getNextAvailableFile } from "../_upload_utils";
import type Events from "./types";
import { namespaceEndpoint } from "./types";

const edgesPath: string = process.env.EDGES_PATH!;

let edgeCreatorServices: EventCalls<EdgeCreatorServices>;

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    const dmSocket = new SocketClient(process.env.DM_SOCKET_URL!);
    ({ services: edgeCreatorServices } =
      dmSocket.addNamespace<EdgeCreatorServices>(
        EdgeCreatorServices.namespaceEndpoint,
      ));
    console.log("connected to upload");

    socket.on("uploadFromBase64", async (parameters, callback) => {
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
        "jpg",
      ).match(/\/([^/]+)$/)![1];

      await decode(data, {
        fname: `${path}/${fileName.replace(/.jpg$/, "")}`,
        ext: "jpg",
      });

      await edgeCreatorServices.sendNewEdgePhotoEmail(issuecode);

      callback({ fileName });
    });
  });
};

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
  res: Response,
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
      isEdgePhoto,
    );
    try {
      const { hash } = await validateUpload(
        mimetype,
        targetFilename,
        allowedMimeTypes,
        isEdgePhoto,
        userCredentials,
        edge,
        temporaryPath,
      );
      saveFile(temporaryPath, targetFilename);
      await storePhotoHash(targetFilename, hash);
      targetFilesnames.push(
        targetFilename.replace(
          process.env.EDGES_PATH!,
          process.env.VITE_EDGES_URL!,
        ),
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
  isEdgePhoto: boolean,
) => {
  filename = filename.normalize("NFD").replace(/[\u0300-\u036F]/g, "");

  if (isMultipleEdgePhoto) {
    return getNextAvailableFile(
      `${edgesPath}/tranches_multiples/photo.multiple`,
      "jpg",
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
        "jpg",
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
  filePath: string,
): Promise<{ hash: string }> => {
  if (!allowedMimeTypes.includes(mimetype)) {
    throw new Error(
      JSON.stringify({
        error:
          "Invalid file type: {mimetype}, the following types are allowed: {allowedMimeTypes}",
        placeholders: { mimetype, allowedMimeTypes },
      }),
    );
  }
  const { hash } = readContentsAndCalculateHash(filePath);
  if (isEdgePhoto) {
    if (await hasReachedDailyUploadLimit()) {
      throw new Error(
        JSON.stringify({
          error: "You have reached your daily upload limit",
        }),
      );
    }
    if (await hasAlreadySentPhoto(hash)) {
      throw new Error(
        JSON.stringify({ error: "You have already sent this photo" }),
      );
    }
  } else {
    // await readFile(filestream);
    const otherElementUses = await getFilenameUsagesInOtherModels(
      filename,
      issuecode,
    );
    if (fs.existsSync(filename) && otherElementUses.length) {
      throw new Error(
        JSON.stringify({
          error:
            "This file name is already used in other models, please rename your file",
          placeholders: {
            otherElementUses: JSON.stringify(otherElementUses),
          },
        }),
      );
    }
  }
  return { hash };
};

const hasReachedDailyUploadLimit = async () =>
  (await edgeCreatorServices.checkTodayLimit()).uploadedFilesToday.length > 10;

const hasAlreadySentPhoto = async (hash: string) =>
  (await edgeCreatorServices.getImageByHash(hash)) === null;

const readContentsAndCalculateHash = (
  fileName: string,
): { contents: Buffer; hash: string } => {
  const fileBuffer = fs.readFileSync(fileName);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);

  return { contents: fileBuffer, hash: hashSum.digest("hex") };
};

const getFilenameUsagesInOtherModels = async (
  filename: string,
  currentIssuecode: string,
) =>
  (await edgeCreatorServices.getImagesFromFilename(filename)).filter(
    (otherUse) => currentIssuecode !== otherUse.issuecodeStart,
  );

const saveFile = (temporaryPath: string, finalPath: string) => {
  fs.mkdirSync(dirname(finalPath), { recursive: true });
  fs.renameSync(temporaryPath, finalPath);
};

const storePhotoHash = async (filename: string, hash: string) => {
  await edgeCreatorServices.createElementImage(hash, filename);
};
