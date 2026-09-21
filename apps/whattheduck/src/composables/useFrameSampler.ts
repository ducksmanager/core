/**
 * Frame preparation and gating for the live cover search.
 *
 * Each stage is independently toggleable so the three of them can be benchmarked against each
 * other: flip a flag in `frameSamplerConfig` (or pass an override) and compare the metrics
 * reported on every prepared frame.
 */

export interface FrameSamplerConfig {
  /**
   * Re-encode the captured frame smaller before uploading it.
   *
   * `maxSize` has a hard floor imposed by Pastec: `pastecEstimateRigidTransform` rejects a match
   * whose matched region, projected into the *query* frame, has a bounding-box edge shorter than
   * 100 px. Downscaling shrinks that projection proportionally, so an aggressive `maxSize` starts
   * rejecting otherwise valid matches of covers that do not fill the frame. At 700 px the cover
   * must occupy roughly 15% of the frame, which the A4 guide already guarantees.
   */
  downscale: { enabled: boolean; maxSize: number; quality: number };
  /** Drop frames that are too blurry for ORB keypoints to be worth extracting. */
  blurGate: { enabled: boolean; minSharpness: number };
  /** Drop frames that look like the last one we already searched. */
  motionGate: { enabled: boolean; minDifference: number };
}

export const frameSamplerConfig: FrameSamplerConfig = {
  downscale: { enabled: true, maxSize: 700, quality: 0.7 },
  blurGate: { enabled: true, minSharpness: 120 },
  motionGate: { enabled: true, minDifference: 6 },
};

export interface FrameMetrics {
  /** Variance of the Laplacian; higher is sharper. `undefined` when the blur gate is off. */
  sharpness?: number;
  /** Mean absolute difference against the last searched frame. `undefined` on the first frame. */
  difference?: number;
  /** Size of the payload that would be uploaded, in bytes. */
  bytes: number;
  /** Wall-clock cost of preparing this frame. */
  durationMs: number;
}

/** Pixel size of the frame actually uploaded — the space Pastec's bounding rects are expressed in. */
export interface FrameSize {
  width: number;
  height: number;
}

export type PreparedFrame =
  | { status: 'ready'; dataUrl: string; size: FrameSize; metrics: FrameMetrics }
  | { status: 'skipped'; reason: 'blurry' | 'unchanged'; metrics: FrameMetrics };

/** Sharpness is measured on a 1:1 centre crop — downscaling first would low-pass the very detail we are measuring. */
const SHARPNESS_CROP = 256;
const SIGNATURE_SIZE = 16;

const createCanvas = (size: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  return canvas;
};

const toGrayscale = ({ data }: ImageData) => {
  const gray = new Float32Array(data.length / 4);
  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return gray;
};

const varianceOfLaplacian = (gray: Float32Array, size: number) => {
  let sum = 0;
  let sumOfSquares = 0;
  let count = 0;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const i = y * size + x;
      const laplacian = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - size] - gray[i + size];
      sum += laplacian;
      sumOfSquares += laplacian * laplacian;
      count++;
    }
  }
  return count ? sumOfSquares / count - (sum / count) ** 2 : 0;
};

const meanAbsoluteDifference = (a: Float32Array, b: Float32Array) => {
  let total = 0;
  for (let i = 0; i < a.length; i++) {
    total += Math.abs(a[i] - b[i]);
  }
  return total / a.length;
};

const decode = async (dataUrl: string) => {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return image;
};

export default (config: FrameSamplerConfig = frameSamplerConfig) => {
  const sharpnessCanvas = createCanvas(SHARPNESS_CROP);
  const signatureCanvas = createCanvas(SIGNATURE_SIZE);
  const downscaleCanvas = document.createElement('canvas');

  let lastSearchedSignature: Float32Array | undefined;

  const measureSharpness = (image: HTMLImageElement) => {
    const context = sharpnessCanvas.getContext('2d', { willReadFrequently: true })!;
    // 1:1 centre crop, clamped for sources smaller than the crop.
    const size = Math.min(SHARPNESS_CROP, image.naturalWidth, image.naturalHeight);
    context.clearRect(0, 0, SHARPNESS_CROP, SHARPNESS_CROP);
    context.drawImage(
      image,
      (image.naturalWidth - size) / 2,
      (image.naturalHeight - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size,
    );
    return varianceOfLaplacian(toGrayscale(context.getImageData(0, 0, size, size)), size);
  };

  const computeSignature = (image: HTMLImageElement) => {
    const context = signatureCanvas.getContext('2d', { willReadFrequently: true })!;
    context.drawImage(image, 0, 0, SIGNATURE_SIZE, SIGNATURE_SIZE);
    return toGrayscale(context.getImageData(0, 0, SIGNATURE_SIZE, SIGNATURE_SIZE));
  };

  const downscaleToDataUrl = (image: HTMLImageElement) => {
    const { maxSize, quality } = config.downscale;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    downscaleCanvas.width = Math.round(image.naturalWidth * scale);
    downscaleCanvas.height = Math.round(image.naturalHeight * scale);
    downscaleCanvas.getContext('2d')!.drawImage(image, 0, 0, downscaleCanvas.width, downscaleCanvas.height);
    return {
      dataUrl: downscaleCanvas.toDataURL('image/jpeg', quality),
      size: { width: downscaleCanvas.width, height: downscaleCanvas.height },
    };
  };

  return {
    /**
     * Prepares a captured frame for upload, or reports why it is not worth uploading.
     *
     * `allowMotionSkip` should be false when the previous search produced a result, so that a
     * still scene is re-confirmed rather than silently skipped.
     */
    prepare: async (rawDataUrl: string, allowMotionSkip: boolean): Promise<PreparedFrame> => {
      const startedAt = performance.now();
      const image = await decode(rawDataUrl);
      const metrics: FrameMetrics = { bytes: rawDataUrl.length, durationMs: 0 };
      const done = <T extends PreparedFrame>(frame: T) => {
        metrics.durationMs = performance.now() - startedAt;
        return frame;
      };

      if (config.blurGate.enabled) {
        metrics.sharpness = measureSharpness(image);
        if (metrics.sharpness < config.blurGate.minSharpness) {
          return done({ status: 'skipped', reason: 'blurry', metrics });
        }
      }

      const signature = config.motionGate.enabled ? computeSignature(image) : undefined;
      if (signature && lastSearchedSignature) {
        metrics.difference = meanAbsoluteDifference(signature, lastSearchedSignature);
        if (allowMotionSkip && metrics.difference < config.motionGate.minDifference) {
          return done({ status: 'skipped', reason: 'unchanged', metrics });
        }
      }

      const { dataUrl, size } = config.downscale.enabled
        ? downscaleToDataUrl(image)
        : {
            dataUrl: rawDataUrl,
            size: { width: image.naturalWidth, height: image.naturalHeight },
          };
      metrics.bytes = dataUrl.length;
      lastSearchedSignature = signature;

      return done({ status: 'ready', dataUrl, size, metrics });
    },

    reset: () => {
      lastSearchedSignature = undefined;
    },
  };
};
