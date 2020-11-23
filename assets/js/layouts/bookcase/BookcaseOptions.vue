<template>
  <div v-if="loading">
    {{ l10n.CHARGEMENT }}
  </div>
  <div
    v-else
    class="bookcase-options"
  >
    <div
      v-for="(l10nKey, textureType) in textureTypes"
      :key="textureType"
    >
      <h5>{{ l10n[l10nKey] }}</h5>
      <b-dropdown v-model="bookcaseTextures[textureType]">
        <template #button-content>
          <div
            class="selected"
            :style="{backgroundImage: `url('${imagePath}/textures/${bookcaseTextures[textureType]}.jpg'`}"
          >
            {{ bookcaseTextures[textureType] }}
          </div>
        </template>
        <b-dropdown-item
          v-for="texture in textures"
          :key="texture"
          :style="{backgroundImage: `url('${imagePath}/textures/${texture}.jpg'`}"
          @click="bookcaseTextures[textureType] = texture"
        >
          {{ texture.replace(/[^/]+\/ /, '') }}
        </b-dropdown-item>
      </b-dropdown>
    </div>

    <h5>{{ l10n.ORDRE_MAGAZINES }}</h5>

    <SlickList
      v-model="bookcaseOrder"
      class="publication-order"
      helper-class="dragging"
    >
      <SlickItem
        v-for="(publicationCode, index) in bookcaseOrder"
        :key="index"
        :index="index"
      >
        <Publication
          :publicationcode="publicationCode"
          :publicationname="publicationNames[publicationCode]"
        />
      </SlickItem>
    </SlickList>
    <b-alert
      variant="danger"
      :show="error"
    >
      {{ l10n.ERREUR_GENERIQUE }}
    </b-alert>
    <b-btn
      variant="success"
      :disabled="loading"
      @click="submit"
    >
      {{ l10n.VALIDER }}
    </b-btn>
  </div>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import {mapActions, mapMutations, mapState} from "vuex";
import {SlickItem, SlickList} from "vue-slicksort";
import Publication from "../../components/Publication";

export default {
  name: "BookcaseOptions",

  components: {
    Publication,
    SlickList,
    SlickItem
  },
  mixins: [l10nMixin],

  data: () => ({
    error: false,
    textures: [
      'bois/ASH',
      'bois/BALTIC BIRCH',
      'bois/BASSWOOD',
      'bois/BIRDS EYE MAPLE',
      'bois/BUBINGA',
      'bois/BURL WALNUT',
      'bois/CHERRY',
      'bois/CLEAR PINE',
      'bois/DURON',
      'bois/FIDDLEBACK MAKORE',
      'bois/FIGURED MAKORE',
      'bois/HICKORY',
      'bois/HOMOSOTE',
      'bois/HONDURAN ROSEWOOD',
      'bois/HONDURAS MAHOGANY',
      'bois/ITALIAN POPLAR',
      'bois/KEWAZINGA',
      'bois/KNOTTY PINE',
      'bois/KOA',
      'bois/LACEWOOD',
      'bois/LAUAN',
      'bois/NATURAL BIRCH',
      'bois/NOVA-CORK',
      'bois/OLIVE ASH BURL',
      'bois/PLAIN SLICED BEECH',
      'bois/PLAIN SLICED RED OAK',
      'bois/PLAIN SLICED WENGE',
      'bois/POPLAR',
      'bois/PREFINISHED MAPLE',
      'bois/PURPLEHEART',
      'bois/QUARTERSAWN BEECH',
      'bois/QUARTERSAWN TEAK',
      'bois/QUARTERSAWN WENGE',
      'bois/QUARTERSAWN WHITE OAK',
      'bois/RED BIRCH',
      'bois/RIBBON STRIPE SAPELE',
      'bois/ROTARY DOUGLAS FIR',
      'bois/ROTARY SAPELE',
      'bois/ROTARY WHITE MAPLE',
      'bois/SPANISH CEDAR',
      'bois/TEAK',
      'bois/VERTICAL GRAIN FIR PLY',
      'bois/WALNUT',
      'bois/WHITE BIRCH',
      'bois/ZEBRAWOOD',
    ],
    textureTypes: {
      bookcase: 'SOUS_TEXTURE',
      bookshelf: 'SOUS_TEXTURE_ETAGERE'
    },
    loading: true
  }),

  computed: {
    ...mapState("bookcase", ["bookcaseTextures"]),
    ...mapState("coa", ["publicationNames"]),

    bookcaseOrder: {
      get() {
        return this.$store.state.bookcase.bookcaseOrder
      },
      set(newValue) {
        return this.$store.commit('bookcase/setBookcaseOrder', newValue)
      }
    },

    imagePath: () => window.imagePath,
    username: () => window.username
  },

  async mounted() {
    this.setBookcaseUsername(this.username);
    await this.loadData();
    await this.fetchPublicationNames(this.bookcaseOrder);
  },

  methods: {
    ...mapMutations("bookcase", ["setBookcaseUsername"]),
    ...mapActions("bookcase", ["loadBookcaseTextures", "loadBookcaseOrder", "updateBookcaseTextures", "updateBookcaseOrder"]),
    ...mapActions("coa", ["fetchPublicationNames"]),

    async loadData() {
      await this.loadBookcaseTextures();
      await this.loadBookcaseOrder();
      this.loading = false
    },

    async submit() {
      this.error = false
      this.loading = true
      try {
        await this.updateBookcaseTextures();
        await this.updateBookcaseOrder();
        await this.loadData();
      }
      catch {
        this.error = true
      }
      finally {
        this.loading = false
      }
    }
  }

}
</script>

<style lang="scss">
.bookcase-options {
  h5 {
    margin-top: 10px;
  }

  .selected {
    padding: 5px;
  }

  .dropdown-menu {
    padding: 0;
    max-height: 200px;
    overflow-y: auto;
  }

  .publication-order {
    list-style-type: none;
    min-height: 10px;
    padding: 0;
  }
}

.dragging, .publication-order > div {
  display: flex;
  align-items: center;
  margin-top: 5px;
  padding: 5px 10px;
  line-height: 18px;
  border: 1px solid #cccccc;
  color: #222;
  background: #eeeeee;
  cursor: move;
  user-select: none;
}
</style>