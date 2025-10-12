import * as fs from "fs/promises";
import { InferenceSession, Tensor } from "onnxruntime-node";
import sharp from "sharp-0-34";
import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import namespaces from "../namespaces";

let session: InferenceSession | undefined = undefined;

export const getSession = async () => {
  if (!session) {
    console.log("Loading model...");
    try {
      session = await InferenceSession.create(
        "./services/story-search/model/comic_embedding_model.onnx",
      );
      console.log("Model loaded");
    } catch (error) {
      console.error("Failed to load ONNX model:", error);
      throw new Error(
        "ONNX model not found. Please ensure the model file is downloaded from GitHub release v1.0.0-model",
      );
    }
  }
  return session;
};

const preprocessImage = async (input: string | Buffer) => {
  console.log("preprocessImage...");
  const startTime = Date.now();
  let imageBuffer: Buffer;

  if (typeof input === "string") {
    if (input.startsWith("data:")) {
      const base64Data = input.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Data, "base64");
    } else {
      imageBuffer = await fs.readFile(input);
    }
  } else {
    imageBuffer = input;
  }
  console.log("Image buffer stored");

  const image = await sharp(imageBuffer)
    .resize(224, 224)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data } = image;
  const float32Data = new Float32Array(data.length);

  // Normalize to [-1, 1] just like in training
  for (let i = 0; i < data.length; i++) {
    float32Data[i] = (data[i] / 255 - 0.5) / 0.5;
  }

  // Channels first [1,3,224,224]
  const transposed = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    transposed[i] = float32Data[i * 3]; // R
    transposed[i + 224 * 224] = float32Data[i * 3 + 1]; // G
    transposed[i + 2 * 224 * 224] = float32Data[i * 3 + 2]; // B
  }

  console.log(`preprocessImage done in ${Date.now() - startTime}ms`);

  return new Tensor("float32", transposed, [1, 3, 224, 224]);
};

const getEmbedding = async (input: string | Buffer) => {
  const inputTensor = await preprocessImage(input);
  const output = await (await getSession()).run({ input: inputTensor });
  return output.embedding.data as Float32Array; // normalized embedding
};

export const getImageVector = async (input: string | Buffer) => {
  if (!session) {
    throw new Error("Model not initialized. Call initialize() first.");
  }
  try {
    console.log("getImageVector...");
    const output = await getEmbedding(input);
    return { vector: output };
  } catch (error) {
    throw new Error(`Error processing image: ${error}`);
  }
};

export const formatVectorForDB = (embedding: Float32Array): string =>
  `[${Array.from(embedding).join(",")}]`;

export const findSimilarImages = async (
  imageBufferOrBase64: string | Buffer,
  isCover: boolean,
) => {
  try {
    const queryVector = await getImageVector(imageBufferOrBase64);
    console.log("getImageVector done");
    const vectorString = formatVectorForDB(queryVector.vector);
    console.log("formatVectorForDB done");

    const results = await prismaCoa.$queryRaw<
      {
        entrycode: string;
        issuecode: string;
        storyversioncode: string;
        score: number;
        fullUrl: string;
      }[]
    >`
    WITH 
      inputVector AS (SELECT vec_fromtext(${vectorString}) as v),
      vector_similarity AS (
        SELECT 
          ev.entrycode,
          VEC_DISTANCE_COSINE(ev.v, (SELECT v from inputVector)) as similarity
        FROM inducks_entryurl_vector ev WHERE is_cover=${isCover} 
      )
      SELECT
        vector_similarity.entrycode,
        1 - vector_similarity.similarity as score,
        e.issuecode,
        sv.storyversioncode,
        CONCAT('webusers/webusers/', eu.url) as fullUrl
      FROM vector_similarity
      INNER JOIN inducks_entry e ON e.entrycode = vector_similarity.entrycode
      INNER JOIN inducks_entryurl eu ON (eu.entrycode = e.entrycode AND eu.sitecode = 'webusers')
      INNER JOIN inducks_storyversion sv ON sv.storyversioncode = e.storyversioncode
      WHERE similarity < 0.15
      ORDER BY similarity
      LIMIT 5
    `;
    console.log("Query done, results:", results);
    return { results } as const;
  } catch (error) {
    console.error("Error finding similar images:", error);
    return {
      error: error as string,
    } as const;
  }
};

const listenEvents = () => {
  return {
    getIndexSize: async (isCover: boolean) =>
      prismaCoa.inducks_entryurl_vector.count({
        where: {
          isCover,
        },
      }),
    findSimilarImages: async (
      imageBufferOrBase64: string | Buffer,
      isCover: boolean,
    ) =>
      session
        ? findSimilarImages(imageBufferOrBase64, isCover)
        : ({ error: "Session not initialized" } as const),
  };
};

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.STORY_SEARCH, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
