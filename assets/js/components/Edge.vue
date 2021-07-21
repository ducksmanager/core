<template>
  <IssueEdgePopover
    :id="`${id}-popover`"
    :has-edge="existing"
    :extra-points="popularity"
  >
    <template #title>
      <Issue
        :publicationcode="publicationCode"
        :issuenumber="issueNumber"
        :publicationname="publicationNames[publicationCode]"
      />
    </template>
    <div
      :id="id"
      ref="edge"
      :class="{edge: true, visible: !invisible && (imageLoaded || spriteLoaded), [spriteClass]: true}"
      :style="load && imageLoaded ? {
        backgroundImage:`url(${src})`,
        backgroundSize: `${width}px ${height}px`,
        width: `${width}px`,
        height: `${height}px`
      } : {}"
      @click="$emit('open-book')"
    >
      <div
        v-if="highlighted"
        class="highlighted"
        :style="{
          width: `${width}px`,
          height: `${height}px`
        }"
      />
      <img
        v-if="load && !imageLoaded"
        class="temp-image"
        :src="src"
        @load="onImageLoad"
        @error="onImageError"
      >
    </div>
  </IssueEdgePopover>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import * as axios from "axios";
import IssueEdgePopover from "./IssueEdgePopover";
import Issue from "./Issue";
import l10nMixin from "../mixins/l10nMixin";

const EDGES_ROOT = 'https://edges.ducksmanager.net/edges/'
const SPRITES_ROOT = 'https://res.cloudinary.com/dl7hskxab/image/sprite/'

export default {
  name: "Edge",
  components: {Issue, IssueEdgePopover},
  mixins: [l10nMixin],
  props: {
    id: {
      type: String,
      required: true
    },
    publicationCode: {
      type: String,
      required: true
    },
    issueNumber: {
      type: String,
      required: true
    },
    issueNumberReference: {
      type: String,
      default: null
    },
    creationDate: {
      type: String,
      default: null
    },
    popularity: {
      type: Number,
      default: null
    },
    spritePath: {
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
    },
    invisible: {
      type: Boolean,
      default: false
    },
    highlighted: {
      type: Boolean,
      default: false
    }
  },
  emits: ['loaded', 'open-book'],

  data: () => ({
    imageLoaded: false,
    spriteLoaded: false,
    spriteHasAutoFormat: true,
    ignoreSprite: false,
    width: null,
    height: null
  }),

  computed: {
    ...mapState("bookcase", ["loadedSprites"]),
    ...mapState("coa", ["publicationNames"]),

    countryCode() {
      return this.publicationCode.split('/')[0]
    },

    magazineCode() {
      return this.publicationCode.split('/')[1]
    },

    src() {
      return this.spritePath && !this.ignoreSprite
        ? `${SPRITES_ROOT}${this.spritePath}.png`
        : `${EDGES_ROOT}${this.countryCode}/gen/${this.magazineCode}.${this.issueNumberReference || this.issueNumber}.png?${new Date(this.creationDate).getTime()}`;
    },

    spriteClass() {
      return this.id && this.spritePath ? `edges-${this.publicationCode.replace(/\//g, '-')}-${this.issueNumber}` : ''
    }
  },

  methods: {
    ...mapMutations("bookcase", ["addLoadedSprite"]),
    async onImageLoad({target}) {
      if (this.spritePath && !this.ignoreSprite) {
        if (this.loadedSprites[this.spritePath]) {
          this.loadEdgeFromSprite()
        } else {
          try {
            const css = (await axios.get(`${SPRITES_ROOT}${this.spritePath.replace('f_auto/', '')}.css`)).data
            const style = document.createElement('style');
            style.textContent = css;
            document.head.append(style);

            this.addLoadedSprite({ spritePath: this.spritePath, css })
            this.loadEdgeFromSprite()
          } catch (_) {
            this.ignoreSprite = true
          }
        }
      } else {
        this.width = target.naturalWidth
        this.height = target.naturalHeight
        this.imageLoaded = true
        this.$emit('loaded', [this.id])
      }
    },

    loadEdgeFromSprite() {
      if (this.loadedSprites[this.spritePath].indexOf(`.${this.spriteClass} {`) === -1) {
        this.ignoreSprite = true
        return
      }
      const vm = this
      let retries = 0
      const checkWidthInterval = setInterval(() => {
        if (vm.$refs.edge.clientWidth > 0) {
          vm.spriteLoaded = true
          vm.width = vm.$refs.edge.clientWidth
          vm.height = vm.$refs.edge.clientHeight
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
    box-shadow: 0 0 15px 15px rgba(255,255,255,0.8);
    z-index: 100;
  }
}
</style>
