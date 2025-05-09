import type { ImageFeatureExtractionPipeline } from "@huggingface/transformers";
import { pipeline } from "@huggingface/transformers";
import * as fs from "fs/promises";
import * as os from "os";
import path from "path";
import sharp from "sharp";
import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import namespaces from "../namespaces";

let model: ImageFeatureExtractionPipeline;

export const loadModel = async () => {
  if (!model) {
    model = await pipeline<"image-feature-extraction">(
      "image-feature-extraction",
      "Xenova/vit-base-patch16-224-in21k",
      {},
    );
  }
  return model;
};

const preprocessImage = async (input: string | Buffer): Promise<string> => {
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

  const processedBuffer = await sharp(imageBuffer)
    .resize(224, 224)
    .toFormat("jpeg")
    .toBuffer();

  const tempPath = path.join(os.tmpdir(), `processed-${Date.now()}.jpg`);
  await fs.writeFile(tempPath, processedBuffer);
  return tempPath;
};

export const getImageVector = async (input: string | Buffer) => {
  if (!model) {
    throw new Error("Model not initialized. Call initialize() first.");
  }
  try {
    const startTime = Date.now();
    const processedPath = await preprocessImage(input);
    const output = await model(processedPath);
    await fs.unlink(processedPath);

    // The raw output is a 2D tensor of shape [num_patches, hidden_size]
    // We need to reduce it to a 1D vector of size 1024
    const rawVector = Array.from(output.data);
    const numPatches = 197; // 224x224 image with 16x16 patches = 14x14 patches + 1 CLS token
    const hiddenSize = 768; // Base ViT hidden size

    // Reshape the raw vector into patches
    const patches: number[][] = [];
    for (let i = 0; i < numPatches; i++) {
      patches.push(
        rawVector.slice(i * hiddenSize, (i + 1) * hiddenSize) as number[],
      );
    }

    // Mean pool across patches to get a 768-dimensional vector
    const pooledVector = new Array(hiddenSize).fill(0);
    for (let i = 0; i < hiddenSize; i++) {
      for (let j = 0; j < numPatches; j++) {
        pooledVector[i] += patches[j][i];
      }
      pooledVector[i] /= numPatches;
    }

    // Pad or truncate to 1024 dimensions
    const finalVector = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(hiddenSize, 1024); i++) {
      finalVector[i] = pooledVector[i];
    }

    const filename =
      typeof input === "string" && !input.startsWith("data:")
        ? path.basename(input)
        : `image-${Date.now()}.jpg`;

    const endTime = Date.now();
    console.log(`Time taken: ${endTime - startTime}ms`);

    return { vector: finalVector, filename };
  } catch (error) {
    throw new Error(`Error processing image: ${error}`);
  }
};

const formatVectorForDB = (vector: number[]): string =>
  `[${vector.map((v) => v.toFixed(6)).join(",")}]`;

const listenEvents = () => {
  loadModel();
  return {
    getIndexSize: async () => prismaCoa.entryUrlVector.count(),
    findSimilarImages: async (imageBufferOrBase64: string | Buffer) => {
      try {
        const queryVector = await getImageVector(imageBufferOrBase64);
        const vectorString = formatVectorForDB(queryVector.vector);

        return await prismaCoa.$queryRaw<
          {
            entryurlId: number;
            entrycode: string;
            issuecode: string;
            similarity: number;
          }[]
        >`
          SELECT 
            ev.entryurl_id as entryurlId,
            eu.entrycode,
            e.issuecode,
            VEC_DISTANCE_COSINE(ev.v, vec_fromtext(${vectorString})) as similarity
          FROM inducks_entryurl_vector ev
          INNER JOIN inducks_entryurl eu ON eu.id = ev.entryurl_id
          INNER JOIN inducks_entry e ON e.entrycode = eu.entrycode
          WHERE eu.entrycode IS NOT NULL and VEC_DISTANCE_COSINE(ev.v, vec_fromtext(${vectorString})) < 0.1
          ORDER BY similarity
          LIMIT 5
        `;
      } catch (error) {
        console.error("Error finding similar images:", error);
        throw error;
      }
    },
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
