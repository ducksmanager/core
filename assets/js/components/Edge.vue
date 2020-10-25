<template>
  <div
    :id="id"
    ref="edge"
    :class="{edge: true, [spriteClass]: true}"
    :style="load && imageLoaded ? {
      backgroundImage:`url(${src})`,
      backgroundSize: `${width}px ${height}px`,
      width: `${width}px`,
      height: `${height}px`,
    } : {}"
  >
    <img
      v-if="load && !imageLoaded"
      class="temp-image"
      :src="src"
      @click="loadCover"
      @load="onImageLoad"
      @error="onImageError"
    >
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import * as axios from "axios";

const EDGES_ROOT = 'https://edges.ducksmanager.net/edges/'
const SPRITES_ROOT = 'https://res.cloudinary.com/dl7hskxab/image/sprite/'

export default {
  name: "Edge",
  props: {
    publicationCode: {
      type: String,
      required: true
    },
    issueNumber: {
      type: String,
      required: true
    },
    spritePath: {
      type: String,
      default: null
    },
    issueNumberReference: {
      type: String,
      default: null
    },
    existing: {
      type: Boolean,
      required: true
    },
    load: {
      type: Boolean,
      required: true
    }
  },
  emits: ['loaded'],

  data: () => ({
    imageLoaded: false,
    ignoreSprite: false,
    id: null,
    countryCode: null,
    magazineCode: null,
    width: null,
    height: null
  }),

  computed: {
    ...mapState("bookcase", ["loadedSprites"]),

    src() {
      return this.spritePath && !this.ignoreSprite
        ? `${SPRITES_ROOT}${this.spritePath}.png`
        : `${EDGES_ROOT}${this.countryCode}/gen/${this.magazineCode}.${this.issueNumberReference || this.issueNumber}.png`;
    },

    spriteClass() {
      return this.id && this.spritePath ? `edges-${this.id.replaceAll('/', '-')}` : ''
    }
  },

  watch: {
    issueNumber: {
      immediate: true,
      handler(newValue) {
        // console.log("value="+newValue)
      }
    }
  },

  mounted() {
    this.id = `${this.publicationCode}/${this.issueNumber}`
    const [ countryCode, magazineCode ] = this.publicationCode.split('/')
    this.countryCode = countryCode
    this.magazineCode = magazineCode
  },

  methods: {
    ...mapMutations("bookcase", ["addLoadedSprite"]),
    async onImageLoad({target}) {
      if (this.spritePath) {
        if (this.loadedSprites[this.spritePath]) {
          this.loadEdgeFromSprite()
        } else {
          try {
            const css = (await axios.get(`${SPRITES_ROOT}${this.spritePath}.css`)).data
            const style = document.createElement('style');
            style.textContent = css;
            document.head.append(style);

            this.addLoadedSprite({spritePath: this.spritePath, css})
            this.loadEdgeFromSprite()
          } catch (_) {
            this.ignoreSprite = true
          }
        }
      } else {
        this.width=target.naturalWidth
        this.height=target.naturalHeight
        this.imageLoaded = true
        this.$emit('loaded', [this.id])
      }
    },

    loadEdgeFromSprite() {
      if (this.loadedSprites[this.spritePath].indexOf(`.${this.spriteClass} {`) === -1) {
        vm.ignoreSprite = true
        return
      }
      const vm = this
      let retries = 0
      const checkWidthInterval = setInterval(() => {
        if (vm.$refs.edge.clientWidth > 0) {
          vm.$emit('loaded', [this.id])
          clearInterval(checkWidthInterval)
        }
        else if (retries > 100) {
          vm.ignoreSprite = true
          clearInterval(checkWidthInterval)
        }
      }, 5)
    },

    onImageError() {
      if (this.spritePath && !this.ignoreSprite) {
        this.ignoreSprite = true
      }
      else {
        this.$emit('loaded', [this.id])
      }
    },
    loadCover() {

    }
  }
}
</script>

<style scoped lang="scss">
.temp-image {
  display: none;
}
.edge {
  position: relative;
  display: inline-block;
  background-color: white;

  &:not(.visible-book)::after {
    position: absolute;
    content: "";
    top: 100%;
    left: -100vw;
    right: -100vw;
    height: 15px;
    z-index: 50;
  }
}
</style>