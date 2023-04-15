<template>
  <div
    :id="id"
    ref="edge"
    class="edge"
    :class="{
      visible: !invisible && (imageLoaded || spriteLoaded),
      [spriteClass]: true,
    }"
    :style="
      imageLoaded
        ? {
            backgroundImage: `url(${src})`,
            backgroundSize: `${width}px ${height}px`,
            width: `${width}px`,
            height: `${height}px`,
          }
        : {}
    "
    @click="emit('open-book')"
  >
    <div
      v-if="highlighted"
      class="highlighted"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
      }"
    />
    <img
      v-if="!imageLoaded"
      class="temp-image"
      :src="src"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { watch } from "vue";

import { bookcase } from "~/stores/bookcase";

const {
  id,
  issuenumber = null,
  publicationcode,
  spritePath = null,
  invisible = false,
  highlighted = false,
} = defineProps<{
  id: string;
  publicationcode: string;
  issuenumber?: string;
  src: string;
  spritePath: string | null;
  invisible?: boolean;
  highlighted?: boolean;
}>();
const emit = defineEmits<{
  (e: "loaded", ids: string[]): void;
  (e: "open-book"): void;
  (e: "ignore-sprite"): void;
}>();
const SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";
const loadedSprites = $computed(() => bookcase().loadedSprites);
const spriteClass = $computed(() =>
  id && spritePath
    ? `edges-${publicationcode.replace(/\//g, "-")}-${issuenumber}`
    : ""
);
const onImageLoad = async (event: Event) => {
  if (spritePath && !ignoreSprite) {
    if (loadedSprites[spritePath]) {
      loadEdgeFromSprite();
    } else {
      try {
        const css = (
          (await axios.get(`${SPRITES_ROOT}${spritePath}.css`)).data as string
        ).replaceAll(
          new RegExp("url\\('[^']+", "g"),
          `url('${SPRITES_ROOT}${spritePath}.png`
        );
        const style = document.createElement("style");
        style.textContent = css;
        document.head.append(style);

        bookcase().addLoadedSprite({
          spritePath,
          css,
        });
        loadEdgeFromSprite();
      } catch (_) {
        ignoreSprite = true;
      }
    }
  } else {
    width = (event.target! as HTMLImageElement).naturalWidth;
    height = (event.target! as HTMLImageElement).naturalHeight;
    imageLoaded = true;
    emit("loaded", [id]);
  }
};
const loadEdgeFromSprite = () => {
  if (!loadedSprites[spritePath || ""].includes(`.${spriteClass} {`)) {
    ignoreSprite = true;
    return;
  }
  const retries = 0;
  const checkWidthInterval = setInterval(() => {
    if (edge?.clientWidth || 0 > 0) {
      spriteLoaded = true;
      width = edge!.clientWidth;
      height = edge!.clientHeight;
      emit("loaded", [id]);
      clearInterval(checkWidthInterval);
    } else if (retries > 100) {
      ignoreSprite = true;
      clearInterval(checkWidthInterval);
    }
  }, 5);
};
const onImageError = () => {
  if (spritePath && !ignoreSprite) {
    ignoreSprite = true;
  } else {
    emit("loaded", [id]);
  }
};

let edge = $ref(null as Element | null);
let imageLoaded = $ref(false);
let spriteLoaded = $ref(false);
let ignoreSprite = $ref(false);
let width = $ref(null as number | null);
let height = $ref(null as number | null);

watch(
  () => ignoreSprite,
  (value) => {
    if (value) {
      console.error(
        `Could not load sprite for edge ${publicationcode} ${issuenumber}: ${spritePath}`
      );
      emit("ignore-sprite");
    }
  }
);
</script>

<style scoped lang="scss">
.temp-image {
  display: none;
}

.edge {
  position: relative;
  display: inline-block;
  visibility: hidden;
  background-color: transparent;
  margin-top: 20px;

  &:not(.visible-book)::after {
    position: absolute;
    content: "";
    top: 100%;
    left: -100vw;
    right: -100vw;
    height: 15px;
    z-index: 50;
  }

  .highlighted {
    position: absolute;
    box-shadow: 0 0 15px 15px rgba(255, 255, 255, 0.8);
    z-index: 100;
  }
}
</style>
