<template>
  <div v-if="loading || !hasPublicationNames">
    {{ $t("Chargement...") }}
  </div>
  <div v-else class="bookcase-options">
    <div v-for="(textureText, textureType) in textureTypes" :key="textureType">
      <h5>{{ textureText }}</h5>
      <b-dropdown v-model="bookcaseOptions.textures[textureType]">
        <template #button-content>
          <div
            class="selected"
            :style="{
              backgroundImage: `url('${imagePath}/textures/${bookcaseOptions.textures[textureType]}.jpg'`,
            }"
          >
            {{ textureWithoutSuperType(bookcaseOptions.textures[textureType]) }}
          </div>
        </template>
        <b-dropdown-item
          v-for="texture in textures"
          :key="texture"
          :style="{
            backgroundImage: `url('${imagePath}/textures/${texture}.jpg'`,
          }"
          @click="bookcaseOptions.textures[textureType] = texture"
        >
          {{ textureWithoutSuperType(texture) }}
        </b-dropdown-item>
      </b-dropdown>
    </div>

    <h5 class="mt-4 mb-3">
      {{ $t("Affichage des exemplaires multiples") }}
    </h5>
    <b-form-checkbox v-model="bookcaseOptions.showAllCopies">
      {{ $t("Afficher les doubles de ma collection dans la bibliothèque") }}
    </b-form-checkbox>

    <h5 v-if="Object.keys(bookcaseOrder).length" class="mt-4 mb-3">
      {{ $t("Ordre des magazines") }}
    </h5>

    <SlickList
      v-if="bookcaseOrder"
      v-model:list="bookcaseOrder"
      class="publication-order"
      helper-class="dragging"
      @update:list="setBookcaseOrder(bookcaseOrder)"
    >
      <SlickItem
        v-for="(publicationCode, index) in bookcaseOrder"
        :key="publicationCode"
        :index="index"
      >
        <Publication
          :publicationcode="publicationCode"
          :publicationname="publicationNames[publicationCode]"
        />
      </SlickItem>
    </SlickList>
    <b-alert variant="danger" :show="error">
      {{ $t("Une erreur s'est produite.") }}
    </b-alert>
    <b-button
      class="mt-4"
      variant="success"
      :disabled="loading"
      @click="submit"
    >
      {{ $t("Valider") }}
    </b-button>
  </div>
</template>

<script setup>
import {
  BAlert,
  BButton,
  BDropdown,
  BDropdownItem,
  BFormCheckbox,
} from "bootstrap-vue-3";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { SlickItem, SlickList } from "vue-slicksort";

import Publication from "../../components/Publication";
import { user } from "../../composables/global";
import { imagePath } from "../../composables/imagePath";
import { bookcase } from "../../stores/bookcase";
import { coa } from "../../stores/coa";

const { username } = user(),
  { t: $t } = useI18n(),
  bookcaseStore = bookcase(),
  textures = [
    "bois/ASH",
    "bois/BALTIC BIRCH",
    "bois/BASSWOOD",
    "bois/BIRDS EYE MAPLE",
    "bois/BUBINGA",
    "bois/BURL WALNUT",
    "bois/CHERRY",
    "bois/CLEAR PINE",
    "bois/DURON",
    "bois/FIDDLEBACK MAKORE",
    "bois/FIGURED MAKORE",
    "bois/HICKORY",
    "bois/HOMOSOTE",
    "bois/HONDURAN ROSEWOOD",
    "bois/HONDURAS MAHOGANY",
    "bois/ITALIAN POPLAR",
    "bois/KEWAZINGA",
    "bois/KNOTTY PINE",
    "bois/KOA",
    "bois/LACEWOOD",
    "bois/LAUAN",
    "bois/NATURAL BIRCH",
    "bois/NOVA-CORK",
    "bois/OLIVE ASH BURL",
    "bois/PLAIN SLICED BEECH",
    "bois/PLAIN SLICED RED OAK",
    "bois/PLAIN SLICED WENGE",
    "bois/POPLAR",
    "bois/PREFINISHED MAPLE",
    "bois/PURPLEHEART",
    "bois/QUARTERSAWN BEECH",
    "bois/QUARTERSAWN TEAK",
    "bois/QUARTERSAWN WENGE",
    "bois/QUARTERSAWN WHITE OAK",
    "bois/RED BIRCH",
    "bois/RIBBON STRIPE SAPELE",
    "bois/ROTARY DOUGLAS FIR",
    "bois/ROTARY SAPELE",
    "bois/ROTARY WHITE MAPLE",
    "bois/SPANISH CEDAR",
    "bois/TEAK",
    "bois/VERTICAL GRAIN FIR PLY",
    "bois/WALNUT",
    "bois/WHITE BIRCH",
    "bois/ZEBRAWOOD",
  ],
  bookcaseOptions = $computed(() => bookcaseStore.bookcaseOptions),
  publicationNames = $computed(() => coa().publicationNames),
  textureTypes = $computed(() => ({
    bookcase: $t("Sous-texture"),
    bookshelf: $t("Sous-texture de l'étagère"),
  })),
  setBookcaseUsername = bookcaseStore.setBookcaseUsername,
  setBookcaseOrder = bookcaseStore.setBookcaseOrder,
  loadBookcaseOptions = bookcaseStore.loadBookcaseOptions,
  loadBookcaseOrder = bookcaseStore.loadBookcaseOrder,
  updateBookcaseOptions = bookcaseStore.updateBookcaseOptions,
  updateBookcaseOrder = bookcaseStore.updateBookcaseOrder,
  fetchPublicationNames = coa().fetchPublicationNames,
  loadData = async () => {
    await loadBookcaseOptions();
    await loadBookcaseOrder();
    loading = false;
  },
  submit = async () => {
    error = false;
    loading = true;
    try {
      await updateBookcaseOptions();
      await updateBookcaseOrder();
      await loadData();
    } catch {
      error = true;
    } finally {
      loading = false;
    }
  },
  textureWithoutSuperType = (texture) => texture.replace(/^[^/]+\//, "");

let error = $ref(false),
  loading = $ref(true),
  hasPublicationNames = $ref(false),
  bookcaseOrder = $ref(null);

onMounted(async () => {
  setBookcaseUsername(username);
  await loadData();
  bookcaseOrder = bookcaseStore.bookcaseOrder;
  await fetchPublicationNames(bookcaseOrder);
  bookcaseOrder = bookcaseOrder.filter((publicationCode) =>
    Object.keys(publicationNames).includes(publicationCode)
  );
  hasPublicationNames = true;
});
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

.dragging,
.publication-order > div {
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
