import { InferenceSession, Tensor, env } from "onnxruntime-web";

// Configure ONNX Runtime Web to use CDN for WASM files
// This avoids MIME type issues with local file serving
env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

// Suppress warnings (like CPU vendor detection warnings)
// Set to 'error' to only show errors, or 'verbose' for all logs
env.logLevel = "error";

let session: InferenceSession | null = null;
let modelLoadingPromise: Promise<InferenceSession> | null = null;

const MODEL_URL =
  import.meta.env.VITE_ONNX_MODEL_URL ||
  "/efficientnet_b0_comic_embedding.onnx";

export const loadModel = async (): Promise<InferenceSession> => {
  if (session) {
    return session;
  }

  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }

  modelLoadingPromise = InferenceSession.create(MODEL_URL, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });

  session = await modelLoadingPromise;
  modelLoadingPromise = null;
  return session;
};

/**
 * Preprocess an image from a base64 data URL or image element
 * Returns a tensor ready for ONNX inference
 */
const preprocessImage = async (
  input: string | HTMLImageElement | HTMLCanvasElement,
): Promise<Tensor> => {
  let imageElement: HTMLImageElement | HTMLCanvasElement;

  if (typeof input === "string") {
    // Base64 data URL
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = input;
    });
    imageElement = img;
  } else {
    imageElement = input;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.drawImage(imageElement, 0, 0, 224, 224);

  const imageData = ctx.getImageData(0, 0, 224, 224);
  const data = imageData.data; // RGBA format

  // Convert RGBA to RGB
  const rgbData = new Uint8Array(224 * 224 * 3);
  for (let i = 0; i < 224 * 224; i++) {
    rgbData[i * 3] = data[i * 4]; // R
    rgbData[i * 3 + 1] = data[i * 4 + 1]; // G
    rgbData[i * 3 + 2] = data[i * 4 + 2]; // B
  }

  // Normalize to [0, 1] and apply ImageNet normalization
  const float32Data = new Float32Array(rgbData.length);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];

  for (let i = 0; i < rgbData.length; i++) {
    const channel = i % 3; // R=0, G=1, B=2
    float32Data[i] = (rgbData[i] / 255 - mean[channel]) / std[channel];
  }

  // Transpose to channels-first format [1, 3, 224, 224]
  const transposed = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < 224 * 224; i++) {
    transposed[i] = float32Data[i * 3]; // R
    transposed[i + 224 * 224] = float32Data[i * 3 + 1]; // G
    transposed[i + 2 * 224 * 224] = float32Data[i * 3 + 2]; // B
  }

  return new Tensor("float32", transposed, [1, 3, 224, 224]);
};

export const getImageVector = async (
  base64Image: string,
): Promise<Float32Array> => {
  const modelSession = await loadModel();
  const inputTensor = await preprocessImage(base64Image);

  try {
    const output = await modelSession.run({ input: inputTensor });

    if (!output || !output.embedding) {
      throw new Error("Model output is missing 'embedding' field");
    }

    const embeddingData = output.embedding.data;
    if (!(embeddingData instanceof Float32Array)) {
      throw new Error(
        `Invalid embedding data type: expected Float32Array, got ${typeof embeddingData}`,
      );
    }

    return embeddingData;
  } catch (error) {
    throw new Error(
      `ONNX inference failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
