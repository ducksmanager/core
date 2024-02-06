import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { Socket } from "socket.io";

import { NamespaceWithData, ServerWithData, SessionData, SessionDataWithIndexation } from "~/index";
import { CloudinaryResourceContext } from '~dumili-types/CloudinaryResourceContext'

import { runKumiko } from "./kumiko";
import { extendBoundaries, runOcr } from "./ocr";
import Events, { IndexationEvents, ResourceApiResponseWithCustomUser } from "./types";

const GetIndexationResourcesMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void) => {
  socket.data.resources = await getIndexationResources(socket.data.user!.username, socket.nsp.name.split("/").pop() as string)

  next()
}

export default (io: ServerWithData<SessionData>) => {
  const namespace = io.of(Events.namespaceEndpoint) as NamespaceWithData<Events, SessionData>;
  namespace.on("connection", (socket) => {
    socket.on("getResources", async (callback) => getIndexationResources(socket.data.user.username).then(data => {
      callback(data as ResourceApiResponseWithCustomUser)
      for (const indexation of data.resources) {
        const indexationId = (indexation.context as CloudinaryResourceContext).custom.indexation
        const indexationNamespace = io.of(`${Events.namespaceEndpoint}/${indexationId}`) as NamespaceWithData<IndexationEvents, SessionDataWithIndexation>;
        indexationNamespace.use(GetIndexationResourcesMiddleware).on("connection", (indexationSocket) => {

          indexationSocket.on("getIndexationResources", async (callback) => getIndexationResources(socket.data.user.username, indexationId).then(callback).catch((error) => callback({ error: "Cloudinary error", errorDetails: error })))

          indexationSocket.on('getKumikoResults', async (callback) => {
            const output = await runKumiko(
              indexationSocket.data.indexation.resources.map(({ secure_url }) => secure_url)
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
          })

          indexationSocket.on('getOcrResults', async (pageUrl, callback) => {
            if (!indexationSocket.data.indexation.resources.some(({ secure_url }) => secure_url === pageUrl)) {
              callback({ error: "Invalid page URL" })
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
              await sharp(input).extract(extendBoundaries(firstPanel, 20)).toBuffer()
            ).toString("base64");
            callback({ data: await runOcr(base64) });
          });
        })
      }
    }))
  })
}

export const getIndexationResources = async (
  username: string,
  indexation?: string,
) =>
(cloudinary.api
  .resources_by_context(indexation ? "indexation" : "first_image", indexation || 'true', {
    context: true,
  })
  .catch(async (err) => {
    console.error(err);
    throw err;
  }));
