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
        "./services/story-search/model/efficientnet_b0_comic_embedding.onnx",
      );
      console.log("Model loaded");
    } catch (error) {
      console.error("Failed to load ONNX model:", error);
      throw new Error(
        "EfficientNet-B0 ONNX model not found. Please ensure efficientnet_b0_comic_embedding.onnx is in the model directory",
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
  
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error("Empty image buffer");
  }
  
  console.log("Image buffer stored");

  // Validate and process image with error handling
  // For Sharp 0.34 compatibility, get buffer and metadata separately
  let data: Buffer;
  let info: { width: number; height: number; channels: number };
  
  try {
    // Process image: resize to exact size
    // Using simple resize(width, height) which stretches to exact dimensions
    // This avoids potential issues with options objects in different sharp versions
    const buffer = await sharp(imageBuffer)
      .resize(224, 224)
      .raw()
      .toBuffer();
    
    // For raw buffers, calculate dimensions from buffer size
    // Buffer size = width * height * channels
    // We know width=224, height=224, so channels = buffer.length / (224 * 224)
    const expectedSize = 224 * 224;
    const channels = Math.floor(buffer.length / expectedSize);
    
    if (channels < 3 || channels > 4) {
      throw new Error(
        `Unexpected buffer size: ${buffer.length} bytes. Expected ${expectedSize * 3} (RGB) or ${expectedSize * 4} (RGBA), got ${expectedSize * channels}`
      );
    }
    
    // Extract info from calculated values (not metadata, which may return original dimensions)
    info = {
      width: 224,
      height: 224,
      channels: channels,
    };
    
    data = buffer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    throw new Error(
      `Failed to process image with sharp: ${errorMessage}${errorStack ? `\nStack: ${errorStack}` : ""}`
    );
  }
  
  // Validate image dimensions
  if (info.width !== 224 || info.height !== 224) {
    throw new Error(
      `Invalid image dimensions: expected 224x224, got ${info.width}x${info.height}`
    );
  }
  
  // Handle RGBA (4 channels) by converting to RGB
  let rgbData: Uint8Array;
  if (info.channels === 4) {
    // Convert RGBA to RGB by dropping alpha channel
    rgbData = new Uint8Array(224 * 224 * 3);
    for (let i = 0; i < 224 * 224; i++) {
      rgbData[i * 3] = data[i * 4]; // R
      rgbData[i * 3 + 1] = data[i * 4 + 1]; // G
      rgbData[i * 3 + 2] = data[i * 4 + 2]; // B
      // Skip alpha channel
    }
  } else if (info.channels === 3) {
    rgbData = data;
  } else {
    throw new Error(
      `Unsupported number of channels: expected 3 or 4, got ${info.channels}`
    );
  }
  
  if (rgbData.length !== 224 * 224 * 3) {
    throw new Error(
      `Invalid image data length: expected ${224 * 224 * 3}, got ${rgbData.length}`
    );
  }

  const float32Data = new Float32Array(rgbData.length);

  // ImageNet normalization for EfficientNet: normalize to [0,1] then apply mean/std
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  
  for (let i = 0; i < rgbData.length; i++) {
    const channel = i % 3; // R=0, G=1, B=2
    float32Data[i] = (rgbData[i] / 255 - mean[channel]) / std[channel];
  }

  // Channels first [1,3,224,224]
  const transposed = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    transposed[i] = float32Data[i * 3]; // R
    transposed[i + 224 * 224] = float32Data[i * 3 + 1]; // G
    transposed[i + 2 * 224 * 224] = float32Data[i * 3 + 2]; // B
  }

  console.log(`preprocessImage done in ${Date.now() - startTime}ms`);

  // Validate tensor before returning
  if (transposed.length !== 3 * 224 * 224) {
    throw new Error(
      `Invalid tensor size: expected ${3 * 224 * 224}, got ${transposed.length}`
    );
  }

  return new Tensor("float32", transposed, [1, 3, 224, 224]);
};

const getEmbedding = async (input: string | Buffer) => {
  const inputTensor = await preprocessImage(input);
  
  // Validate session is available
  const session = await getSession();
  if (!session) {
    throw new Error("ONNX session not initialized");
  }
  
  // Validate tensor
  if (!inputTensor || !inputTensor.data) {
    throw new Error("Invalid input tensor");
  }
  
  try {
    // Run inference with explicit input name matching the model export
    const output = await session.run({ input: inputTensor });
    
    // Validate output
    if (!output || !output.embedding) {
      throw new Error("Model output is missing 'embedding' field");
    }
    
    const embeddingData = output.embedding.data;
    if (!embeddingData || !(embeddingData instanceof Float32Array)) {
      throw new Error(
        `Invalid embedding data type: expected Float32Array, got ${typeof embeddingData}`
      );
    }
    
    return embeddingData; // normalized embedding
  } catch (error) {
    // Provide more context about the error
    if (error instanceof Error) {
      throw new Error(
        `ONNX inference failed: ${error.message}. Input tensor shape: [${inputTensor.dims?.join(", ")}], type: ${inputTensor.type}`
      );
    }
    throw error;
  }
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

const findSimilarImagesFromVector = async (
  vector: Float32Array,
  isCover: boolean,
) => {
  try {
    const vectorString = formatVectorForDB(vector);
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

export const findSimilarImages = async (
  imageBufferOrBase64: string | Buffer,
  isCover: boolean,
) => {
  try {
    const queryVector = await getImageVector(imageBufferOrBase64);
    console.log("getImageVector done");
    return await findSimilarImagesFromVector(queryVector.vector, isCover);
  } catch (error) {
    console.error("Error finding similar images:", error);
    return {
      error: error as string,
    } as const;
  }
};

const listenEvents = () => ({
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

  findSimilarImagesFromVector: async (
    vector: number[],
    isCover: boolean,
  ) => {
    try {
      const float32Vector = new Float32Array(vector);
      return await findSimilarImagesFromVector(float32Vector, isCover);
    } catch (error) {
      console.error("Error finding similar images from vector:", error);
      return {
        error: error as string,
      } as const;
    }
  },
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.STORY_SEARCH, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
