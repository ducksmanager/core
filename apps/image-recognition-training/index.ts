import { pipeline } from "@bperel/transformers";
// import { pipeline } from "@xenova/transformers";

pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32").then(
  async (image_feature_extractor) => {
    const url =
      "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cats.png";
    const features = await image_feature_extractor(url);
  }
);
