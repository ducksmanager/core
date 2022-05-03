<template>
  <div
    :id="id"
    ref="edge"
    :class="{
      edge: true,
      visible: !invisible && (imageLoaded || spriteLoaded),
      [spriteClass]: true,
    }"
    :style="
      load && imageLoaded
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
      v-if="load && !imageLoaded"
      class="temp-image"
      :src="src"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>
<script setup>
import * as axios from "axios";
import { computed, ref } from "vue";

import { bookcase } from "../stores/bookcase";

const SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  spritePath: {
    type: String,
    default: null,
  },
  load: {
    type: Boolean,
    required: true,
  },
  invisible: {
    type: Boolean,
    default: false,
  },
  highlighted: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["loaded", "open-book"]);

const edge = ref(null),
  imageLoaded = ref(false),
  spriteLoaded = ref(false),
  ignoreSprite = ref(false),
  width = ref(null),
  height = ref(null),
  loadedSprites = bookcase().bookcase,
  spriteClass = computed(() =>
    props.id && props.spritePath
      ? `edges-${props.publicationCode.replace(/\//g, "-")}-${
          props.issueNumber
        }`
      : ""
  );

const onImageLoad = async ({ target }) => {
  if (props.spritePath && !ignoreSprite.value) {
    if (loadedSprites.value[props.spritePath]) {
      loadEdgeFromSprite.value();
    } else {
      try {
        const css = (
          await axios.get(
            `${SPRITES_ROOT}${props.spritePath.replace("f_auto/", "")}.css`
          )
        ).data;
        const style = document.createElement("style");
        style.textContent = css;
        document.head.append(style);

        bookcase().addLoadedSprite({ spritePath: props.spritePath, css });
        loadEdgeFromSprite.value();
      } catch (_) {
        ignoreSprite.value = true;
      }
    }
  } else {
    width.value = target.naturalWidth;
    height.value = target.naturalHeight;
    imageLoaded.value = true;
    emit("loaded", [props.id]);
  }
};

const loadEdgeFromSprite = () => {
  if (
    loadedSprites.value[props.spritePath].indexOf(`.${spriteClass.value} {`) ===
    -1
  ) {
    ignoreSprite.value = true;
    return;
  }
  let retries = 0;
  const checkWidthInterval = setInterval(() => {
    if (edge.value.clientWidth > 0) {
      spriteLoaded.value = true;
      width.value = edge.value.clientWidth;
      height.value = edge.value.clientHeight;
      emit("loaded", [props.id]);
      clearInterval(checkWidthInterval);
    } else if (retries > 100) {
      ignoreSprite.value = true;
      clearInterval(checkWidthInterval);
    }
  }, 5);
};

const onImageError = () => {
  if (props.spritePath && !ignoreSprite.value) {
    ignoreSprite.value = true;
  } else {
    emit("loaded", [props.id]);
  }
};
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