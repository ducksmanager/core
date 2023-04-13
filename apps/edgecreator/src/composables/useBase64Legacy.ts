export interface ImageMetadata {
  base64: string | undefined;
  width: number | null;
  height: number | null;
}
export default () => {
  const image = ref(null as ImageMetadata | null);
  const loadImage = (
    src: string,
    callback: (img: HTMLImageElement) => void
  ) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas: HTMLCanvasElement = document.createElement("canvas");
      const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx!.drawImage(img, 0, 0);
      image.value = {
        base64: canvas.toDataURL("png"),
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      callback(img);
    };
    img.onerror = (e) => {
      console.error(
        `Base64 image could not be retrieved : ${src} : ${JSON.stringify({
          e,
        })}`
      );
      image.value = { base64: undefined, width: null, height: null };
    };
    img.src = src;
  };

  return { image, loadImage };
};
