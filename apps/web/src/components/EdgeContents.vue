<template>
  <div
    :id="id"
    ref="edge"
    class="edge"
    :class="{
      visible: !invisible && (imageLoaded || spriteLoaded),
      vertical: orientation === 'vertical',
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
const {
  id,
  issuecode,
  spritePath = null,
  invisible = false,
  highlighted = false,
  orientation = "vertical",
} = defineProps<{
  id: string;
  issuecode: string;
  src: string;
  spritePath: string | null;
  invisible?: boolean;
  highlighted?: boolean;
  orientation?: "vertical" | "horizontal";
}>();
const emit = defineEmits<{
  (e: "loaded", ids: string[]): void;
  (e: "open-book"): void;
  (e: "ignore-sprite"): void;
}>();
const SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";

const { addLoadedSprite } = bookcase();
const { loadedSprites } = storeToRefs(bookcase());

const spriteClass = $computed(() =>
  id && spritePath ? `edges-${issuecode}` : "",
);
const onImageLoad = async (event: Event) => {
  if (spritePath && !ignoreSprite) {
    if (loadedSprites.value[spritePath]) {
      loadEdgeFromSprite();
    } else {
      try {
        const css = (
          await (await fetch(`${SPRITES_ROOT}${spritePath}.css`)).text()
        ).replaceAll(
          new RegExp("url\\('[^']+", "g"),
          `url('${SPRITES_ROOT}${spritePath}.png`,
        );
        const style = document.createElement("style");
        style.textContent = css;
        document.head.append(style);

        addLoadedSprite({
          spritePath,
          css,
        });
        loadEdgeFromSprite();
      } catch (_e) {
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
  if (!loadedSprites.value[spritePath || ""].includes(`.${spriteClass} {`)) {
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

let edge = $ref<Element>();
let imageLoaded = $ref(false);
let spriteLoaded = $ref(false);
let ignoreSprite = $ref(false);
let width = $ref<number>();
let height = $ref<number>();

watch($$(ignoreSprite), (value) => {
  if (value) {
    console.error(`Could not load sprite for edge ${issuecode}: ${spritePath}`);
    emit("ignore-sprite");
  }
});
</script>

<style scoped lang="scss">
.temp-image {
  display: none;
}

.edge {
  position: relative;
  visibility: hidden;
  background-color: transparent;

  &.visible {
    visibility: visible;
  }

  &.vertical {
    display: inline-block;
    margin-top: 20px;
  }

  &.vertical:not(.visible-book)::after {
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
