import type { FrameSize } from '~/composables/useFrameSampler';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Maps a rect expressed in captured-frame pixels onto the on-screen preview.
 *
 * Pastec's `bounding_rects` are in the coordinates of the image we uploaded (`ImageReranker::rerank`
 * builds them from the request image's matched keypoints), so they have to be rescaled onto the
 * preview.
 *
 * `@capgo/camera-preview` defaults to `aspectMode: 'contain'`, i.e. the stream is fitted inside the
 * preview view and letterboxed — hence `Math.min`. When the preview rect already matches the frame's
 * aspect ratio (which is what `CameraPreview.start()` reports back), the scale is the same either
 * way and the offsets are zero, so this stays correct for a snugly-fitted rect too.
 */
export const mapFrameRectToPreview = (
  rect: Rect,
  frame: FrameSize,
  preview: Rect,
  aspectMode: 'contain' | 'cover' = 'contain',
): Rect => {
  if (!frame.width || !frame.height) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const fit = aspectMode === 'cover' ? Math.max : Math.min;
  const scale = fit(preview.width / frame.width, preview.height / frame.height);
  const offsetX = preview.x + (preview.width - frame.width * scale) / 2;
  const offsetY = preview.y + (preview.height - frame.height * scale) / 2;

  return {
    x: offsetX + rect.x * scale,
    y: offsetY + rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
};
