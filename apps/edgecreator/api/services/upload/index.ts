import crypto from "crypto";
import fs, { mkdirSync } from "fs";
import { decode } from "node-base64-image";
import { dirname } from "path";
import type { Socket } from "socket.io";
import { SocketClient } from "socket-call-client";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { RequiredAuthMiddleware } from "~dm-services/auth/util";
import type { ClientEvents as EdgeCreatorServices } from "~dm-services/edgecreator";
import namespaces from "~dm-services/namespaces";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import type { SessionData } from "../../index";
import { getEdgesPath } from "../../index";
import { getNextAvailableFile } from "../_upload_utils";

const getEdgeCreatorServices = (token: string) =>
  new SocketClient(
    process.env.DM_SOCKET_URL!,
  ).addNamespace<EdgeCreatorServices>(namespaces.EDGECREATOR, {
    session: {
      getToken: () => Promise.resolve(token),
      clearSession: () => {},
      sessionExists: () => Promise.resolve(true),
    },
  });

const hasReachedDailyUploadLimit = async (token: string) =>
  (await getEdgeCreatorServices(token).checkTodayLimit()).uploadedFilesToday
    .length > 10;

const hasAlreadySentPhoto = async (hash: string, token: string) =>
  (await getEdgeCreatorServices(token).getImageByHash(hash)) !== null;

const calculateHash = (data: string) => {
  const hashSum = crypto.createHash("sha1");
  hashSum.update(data);

  return hashSum.digest("hex");
};

// @ts-expect-error Function will be used when getImagesFromFilename supports SVG models
const _getFilenameUsagesInOtherModels = async (
  filename: string,
  currentIssuecode: string,
  token: string,
) => {
  const issue = await prismaCoa.inducks_issue.findFirstOrThrow({
    where: { issuecode: currentIssuecode },
  });
  return (
    await getEdgeCreatorServices(token).getImagesFromFilename(filename)
  ).filter((otherUse) => issue.issuenumber !== otherUse.issuenumberStart);
};

const storePhotoHash = async (
  filename: string,
  hash: string,
  token: string,
) => {
  await getEdgeCreatorServices(token).createElementImage(hash, filename);
};

const validateUpload = async (
  filename: string,
  isEdgePhoto: boolean,
  issuecode: string,
  filePath: string,
  token: string,
) => {
  const hash = calculateHash(filePath);
  if (isEdgePhoto) {
    if (await hasReachedDailyUploadLimit(token)) {
      return {
        error: "You have reached your daily upload limit",
      } as const;
    }
    if (await hasAlreadySentPhoto(hash, token)) {
      return { error: "You have already sent this photo" } as const;
    }
  } else {
    // TODO uncomment once getImagesFromFilename supports searching file names in SVG models
    // const otherElementUses = await getFilenameUsagesInOtherModels(
    //   filename,
    //   issuecode,
    //   token
    // );
    const otherElementUses: string[] = [];
    if (fs.existsSync(filename) && otherElementUses.length) {
      return {
        error:
          "This file name is already used in other models, please rename your file",
        errorDetails: {
          otherElementUses: JSON.stringify(otherElementUses),
        },
      } as const;
    }
  }
  return { hash };
};

const getTargetFilePath = async (
  filename: string,
  isMultipleEdgePhoto: boolean,
  issuecode: string,
  isEdgePhoto: boolean,
) => {
  filename = filename.normalize("NFD").replace(/[\u0300-\u036F]/g, "");

  if (isMultipleEdgePhoto) {
    return getNextAvailableFile(
      `${getEdgesPath()}/tranches_multiples/photo.multiple`,
      "jpg",
    );
  } else {
    const { publicationcode, issuenumber } =
      await prismaCoa.inducks_issue.findFirstOrThrow({
        where: { issuecode },
      });
    const [countrycode, magazinecode] = publicationcode.split("/");
    let filePath = `${getEdgesPath()}/${countrycode}`;
    filePath = isEdgePhoto
      ? getNextAvailableFile(
          `${filePath}/photos/${magazinecode}.${issuenumber}.photo`,
          "jpg",
        )
      : `${filePath}/elements/${
          filename.includes(magazinecode)
            ? filename
            : `${magazinecode}.${filename}`
        }`;

    mkdirSync(dirname(filePath), { recursive: true });
    return filePath;
  }
};

export type UploadServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, SessionData>,
  Record<string, never>
>;

const listenEvents = ({ _socket: socket }: UploadServices) => ({
  uploadFromBase64: async (parameters: {
    data: string;
    issuecode: string;
    isMultiple: boolean;
    fileName: string;
  }) => {
    const { issuecode, isMultiple, fileName, data } = parameters;
    const cleanData = data.includes(",") ? data.split(",")[1] : data;
    const isEdgePhoto = !fileName.toLowerCase().endsWith(".png");
    const targetFilePath = await getTargetFilePath(
      fileName,
      isMultiple,
      issuecode,
      isEdgePhoto,
    );

    const token = socket.data.user!.token;
    const targetFileName = targetFilePath.split("/").pop()!;

    const validationResults = await validateUpload(
      targetFileName,
      isEdgePhoto,
      issuecode,
      cleanData,
      token,
    );

    if ("error" in validationResults) {
      return validationResults;
    }

    const { hash } = validationResults;

    await decode(cleanData, {
      fname: `${targetFilePath.replace(/.[^.]+$/, "")}`,
      ext: "jpg",
    });

    await storePhotoHash(targetFileName, hash, token);

    await getEdgeCreatorServices(token).sendNewEdgePhotoEmail(issuecode);

    return { fileName };
  },
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>("/upload", {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
