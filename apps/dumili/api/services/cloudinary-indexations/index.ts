import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { Socket } from "socket.io";

import {
  NamespaceWithData,
  ServerWithData,
  SessionData,
  SessionDataWithIndexation,
} from "~/index";
import { CloudinaryResourceContext } from "~dumili-types/CloudinaryResourceContext";

import { RequiredAuthMiddleware } from "../_auth";
import { runKumiko } from "./kumiko";
import { extendBoundaries, runOcr } from "./ocr";
import Events, { IndexationEvents } from "./types";

const GetIndexationResourcesMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void
) => {
  const username = socket.data.user!.username;
  const indexationId = socket.nsp.name.split("/").pop()!;
  const resources = await getIndexationResources("indexation", indexationId);
  const firstResourceBelongingToOtherUser = resources.find(
    ({ context }) =>
      (context as CloudinaryResourceContext).custom.user === username
  );
  if (firstResourceBelongingToOtherUser) {
    throw new Error(
      `Resource ${firstResourceBelongingToOtherUser.secure_url} in the indexation belong to the user`
    );
  }
  socket.data.indexation = {
    id: indexationId,
    resources,
  };

  next();
};

export default (io: ServerWithData<SessionData>) => {
  io.use(RequiredAuthMiddleware);

  const indexationNamespace = io.of(
    new RegExp(`^${Events.namespaceEndpoint}\\/.+$`)
  ) as NamespaceWithData<IndexationEvents, SessionDataWithIndexation>;
  indexationNamespace
    .use(RequiredAuthMiddleware)
    .use(GetIndexationResourcesMiddleware)
    .on("connection", (indexationSocket) => {
      indexationSocket.on("getIndexationResources", async (callback) => {
        callback({ resources: indexationSocket.data.indexation.resources });
      });

      indexationSocket.on("getKumikoResults", async (callback) => {
        const output = await runKumiko(
          indexationSocket.data.indexation.resources.map(
            ({ secure_url }) => secure_url
          )
        );
        try {
          callback({ data: output });
        } catch (err) {
          console.error(err);
          console.error(output);
          callback({
            error: "Kumiko output could not be parsed",
          });
        }
      });

      indexationSocket.on("getOcrResults", async (pageUrl, callback) => {
        if (
          !indexationSocket.data.indexation.resources.some(
            ({ secure_url }) => secure_url === pageUrl
          )
        ) {
          callback({ error: "Invalid page URL" });
        }
        const kumikoResultsForPage = (await runKumiko([pageUrl]))[0];
        const firstPanel = kumikoResultsForPage.panels[0];

        const input: Buffer = (
          await axios({
            url: pageUrl,
            responseType: "arraybuffer",
          })
        ).data;

        const base64 = (
          await sharp(input)
            .extract(extendBoundaries(firstPanel, 20))
            .toBuffer()
        ).toString("base64");
        callback({ data: await runOcr(base64) });
      });
    });

  const namespace = io.of(Events.namespaceEndpoint) as NamespaceWithData<
    Events,
    SessionData
  >;
  namespace.use(RequiredAuthMiddleware);
  namespace.on("connection", async (socket) => {
    socket.on("getResources", async (callback) => {
      callback({
        resources: await getIndexationResources(
          "user",
          socket.data.user.username
        ),
      });
    });
  });
};

export const getIndexationResources = async (
  key: "user" | "indexation",
  value: string
) =>
  cloudinary.api
    .resources_by_context(key, value, {
      context: true,
    })
    .then(({ resources }) => resources)
    .catch(async (err) => {
      console.error(err);
      throw err;
    });
