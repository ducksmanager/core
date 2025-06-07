import type { ImageFeatureExtractionPipeline } from "@huggingface/transformers";
import { pipeline } from "@huggingface/transformers";
import * as fs from "fs/promises";
import * as os from "os";
import path from "path";
import sharp from "sharp";
import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import namespaces from "../namespaces";

let model: ImageFeatureExtractionPipeline | undefined = undefined;

export const loadModel = async () => {
  if (!model) {
    console.log("Loading model...");
    try {
      console.log("Checking cache directory...");
      const cacheDir = "/tmp/cache/models";
      try {
        await fs.access(cacheDir);
        console.log("Cache directory exists and is accessible");
      } catch (error) {
        console.error("Cache directory error:", error);
        throw new Error(`Cache directory not accessible: ${error}`);
      }

      console.log("Initializing pipeline...");
      model = await pipeline<"image-feature-extraction">(
        "image-feature-extraction",
        "Xenova/vit-base-patch16-224-in21k",
        {
          cache_dir: cacheDir,
          dtype: "fp32"
        }
      );
      console.log("Pipeline initialized successfully");
    } catch (error) {
      console.error("Model loading failed with detailed error:", {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Model loading failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return model;
};

const preprocessImage = async (input: string | Buffer): Promise<string> => {
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

  const processedBuffer = await sharp(imageBuffer)
    .resize(224, 224)
    .toFormat("jpeg")
    .toBuffer();

  const tempPath = path.join(os.tmpdir(), `processed-${Date.now()}.jpg`);
  await fs.writeFile(tempPath, processedBuffer);

  console.log(` Done in ${Date.now() - startTime}ms`);
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
        similarity: number;
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
        vector_similarity.similarity,
        e.issuecode,
        sv.storyversioncode
      FROM vector_similarity
      INNER JOIN inducks_entry e ON e.entrycode = vector_similarity.entrycode
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
  loadModel();
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
    ) => model ? findSimilarImages(imageBufferOrBase64, isCover) : { error: "Model not initialized" } as const,
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
