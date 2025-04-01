import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs-node";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import namespaces from "../namespaces";
import { useSocketEvents } from "socket-call-server";

export const model = () => mobilenet.load();

export const preprocessImage = async (imageBuffer: Buffer) => {
  const tensor = tf.node.decodeImage(imageBuffer);
  
  // Ensure we have a 3D tensor (height, width, channels)
  let rgbTensor: tf.Tensor3D = tensor as tf.Tensor3D;

  // If tensor has more than 3 dimensions, squeeze extra dimensions
  if (tensor.shape.length > 3) {
    rgbTensor = tensor.squeeze();
  }

  // Convert to RGB if needed
  if (rgbTensor.shape[2] === 1) {
    // Grayscale to RGB
    rgbTensor = tf.stack([rgbTensor, rgbTensor, rgbTensor], 2) as tf.Tensor3D;
  } else if (rgbTensor.shape[2] === 4) {
    // RGBA to RGB
    rgbTensor = rgbTensor.slice([0, 0, 0], [-1, -1, 3]);
  }

  // Resize to 224x224 (MobileNet's expected input size)
  const resized = tf.image.resizeBilinear(rgbTensor, [224, 224]);
  
  // Normalize to [-1, 1] range (MobileNet's expected input range)
  const expanded = resized.expandDims(0);
  const normalized = expanded.div(127.5).sub(1);
  
  return normalized;
};

export const getImageVector = async (tensor: tf.Tensor) => {
  const features = (await model()).infer(tensor, true);
  return features.dataSync();
};

const listenEvents = () => ({
  findSimilarImages: async (imageBuffer: Buffer) => {
    try {
      const tensor = await preprocessImage(imageBuffer);
      const queryVector = await getImageVector(tensor);

      // Clean up tensor to prevent memory leaks
      tensor.dispose();

      return await prismaCoa.$queryRaw<
        { entryurlId: number; entrycode: string; similarity: number }[]
      >`
                SELECT 
                    ev.entryurl_id as entryurlId,
                    eu.entrycode,
                    1 - VEC_DISTANCE_COSINE(ev.v, ${queryVector}) as similarity
                FROM inducks_entryurl_vector ev
                INNER JOIN inducks_entryurl eu ON eu.id = ev.entryurlId
                WHERE eu.entrycode IS NOT NULL
                ORDER BY similarity DESC
                LIMIT 5
            `;
    } catch (error) {
      console.error("Error finding similar images:", error);
      throw error;
    }
  },
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.COVER_ID2, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
