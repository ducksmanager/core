import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { Socket } from "socket.io";

import {
  NamespaceWithData,
  redisClient,
  ServerWithData,
  SessionData,
  SessionDataWithIndexation,
} from "~/index";

import { RequiredAuthMiddleware } from "../_auth";
import { runKumiko } from "./kumiko";
import { extendBoundaries, runOcr } from "./ocr";
import Events, { IndexationEvents, ResourceCustomContextStrings, ResourcesWithContext } from "./types";

const GetIndexationResourcesMiddleware = async (
  socket: Socket,
  next: (error?: Error) => void
) => {
  const indexationId = socket.nsp.name.split("/").pop()!;
  socket.data.indexation = {
    id: indexationId,
    resources: await getIndexationResources("indexation", indexationId),
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
        Promise.all([
          runKumiko([pageUrl]),
          axios({
            url: pageUrl,
            responseType: "arraybuffer",
          })
        ]).then(async ([[kumikoResultsForPage], { data: imageData }]) => {
          const firstPanel = kumikoResultsForPage.panels[0];
          const base64 = (
            await sharp(imageData as Buffer)
              .extract(extendBoundaries(firstPanel, 20))
              .toBuffer()
          ).toString("base64");
          return runOcr(base64)
        }).then((output) => {
          callback({ data: output });
        }).catch((err) => {
          callback({ error: "OCR error", errorDetails: err as string });
        })
      });

      indexationSocket.on('updateIndexationResource', async (url, suggestions, callback) => {
        const resourceToUpdate = indexationSocket.data.indexation.resources.find(({ secure_url }) => secure_url === url)
        if (!resourceToUpdate) {
          callback({ error: 'You are not allowed to update this resource' })
          return
        }

        // Invalidates the cache
        (await redisClient).del(`cloudinary:${getRedisKey('indexation', indexationSocket.data.indexation.id)}`)

        const context = Object.entries(suggestions).filter(([, suggestions]) => suggestions).map(([suggestionsType, suggestions]) => `${suggestionsType}=${JSON.stringify(suggestions)}`).join('|')

        cloudinary.uploader.add_context(context, [resourceToUpdate.public_id])

        callback()
      })
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
  redisClient
    .then((client) =>
      client.get(`cloudinary:${getRedisKey(key, value)}`)
    ).then((resources) => {
      if (resources) {
        return JSON.parse(resources) as ResourcesWithContext;
      }
      throw new Error(`key not found: ${key}:${value}`)
    })
    .catch(async () =>
      cloudinary.api
        .resources_by_context(key, value, {
          context: true,
        })
        .then(async ({ resources }) => {
          (await redisClient).set(getRedisKey(key, value), JSON.stringify(resources))
          return resources
        }).then((resources) => resources
          .filter(({ context }) => key === 'user' ? (context as ResourceCustomContextStrings).custom.page === '1' : true)
          .map((resource) => {
            const context = resource.context as ResourceCustomContextStrings
            const { entrySuggestions,
              storyversionKindSuggestions } = context.custom
            return {
              ...resource,
              context: {
                ...context,
                custom: {
                  ...context.custom,
                  entrySuggestions: entrySuggestions && JSON.parse(entrySuggestions || '[]'),
                  storyversionKindSuggestions: storyversionKindSuggestions && JSON.parse(storyversionKindSuggestions),
                }
              }
            } as unknown as ResourcesWithContext['0']
          }))
        .catch(async (err) => {
          console.error(err);
          throw err;
        })
    )

const getRedisKey = (key: 'indexation' | 'user', id: string) => `cloudinary:${key}:${id}`