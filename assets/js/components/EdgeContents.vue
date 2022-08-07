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
import { watch } from "vue";

import { bookcase } from "../stores/bookcase";

const SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";
const { id, issueNumber, publicationCode, spritePath } = defineProps({
  id: {
    type: String,
    required: true,
  },
  publicationCode: {
    type: String,
    required: false,
    default: null,
  },
  issueNumber: {
    type: String,
    required: false,
    default: null,
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
const emit = defineEmits(["loaded", "open-book", "ignore-sprite"]);

const loadedSprites = $computed(() => bookcase().loadedSprites),
  spriteClass = $computed(() =>
    id && spritePath
      ? `edges-${publicationCode.replace(/\//g, "-")}-${issueNumber}`
      : ""
  ),
  onImageLoad = async ({ target }) => {
    if (spritePath && !ignoreSprite) {
      if (loadedSprites[spritePath]) {
        loadEdgeFromSprite();
      } else {
        try {
          const css = (
            await axios.get(
              `${SPRITES_ROOT}${spritePath.replace("f_auto/", "")}.css`
            )
          ).data;
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
      width = target.naturalWidth;
      height = target.naturalHeight;
      imageLoaded = true;
      emit("loaded", [id]);
    }
  },
  loadEdgeFromSprite = () => {
    if (loadedSprites[spritePath].indexOf(`.${spriteClass} {`) === -1) {
      ignoreSprite = true;
      return;
    }
    let retries = 0;
    const checkWidthInterval = setInterval(() => {
      if (edge.clientWidth > 0) {
        spriteLoaded = true;
        width = edge.clientWidth;
        height = edge.clientHeight;
        emit("loaded", [id]);
        clearInterval(checkWidthInterval);
      } else if (retries > 100) {
        ignoreSprite = true;
        clearInterval(checkWidthInterval);
      }
    }, 5);
  },
  onImageError = () => {
    if (spritePath && !ignoreSprite) {
      ignoreSprite = true;
    } else {
      emit("loaded", [id]);
    }
  };

let edge = $ref(null),
  imageLoaded = $ref(false),
  spriteLoaded = $ref(false),
  ignoreSprite = $ref(false),
  width = $ref(null),
  height = $ref(null);

watch(
  () => ignoreSprite,
  (value) => {
    if (value) {
      console.error(
        `Could not load sprite for edge ${publicationCode} ${issueNumber}: ${spritePath}`
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
