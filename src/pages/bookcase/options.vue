<route lang="yaml">
alias: [/bibliotheque/options]
</route>

<template>
  <div v-if="loading || !hasPublicationNames || !bookcaseOptions">
    {{ $t("Chargement...") }}
  </div>
  <div v-else class="bookcase-options">
    <div v-for="(textureText, textureType) in textureTypes" :key="textureType">
      <h5>{{ textureText }}</h5>
      <b-dropdown
        v-model="bookcaseOptions.textures[textureType as 'bookshelf'|'bookcase']"
      >
        <template #button-content>
          <div
            class="selected"
            :style="{
              backgroundImage: `url('${getImagePath(`textures/${bookcaseOptions.textures[textureType as 'bookshelf'|'bookcase']}`)}.jpg')`,
            }"
          >
            {{
              textureWithoutSuperType(
                bookcaseOptions.textures[
                  textureType as "bookshelf" | "bookcase"
                ]
              )
            }}
          </div>
        </template>
        <b-dropdown-item
          v-for="texture in textures"
          :key="texture"
          :style="{
            backgroundImage: `url('${getImagePath(
              `textures/${texture}.jpg`
            )}')`,
          }"
          @click="
            bookcaseOptions!.textures[textureType as 'bookshelf' | 'bookcase'] =
              texture
          "
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

    <h5
      v-if="bookcaseOrder && Object.keys(bookcaseOrder).length"
      class="mt-4 mb-3"
    >
      {{ $t("Ordre des magazines") }}
    </h5>

    <slick-list
      v-if="bookcaseOrder"
      v-model:list="bookcaseOrder"
      class="publication-order"
      helper-class="dragging"
      @update:list="bookcaseStore.bookcaseOrder = bookcaseOrder"
    >
      <slick-item
        v-for="(publicationcode, index) in bookcaseOrder"
        :key="publicationcode"
        :index="index"
      >
        <Publication
          :publicationcode="publicationcode"
          :publicationname="publicationNames[publicationcode]!"
        />
      </slick-item>
    </slick-list>
    <b-alert variant="danger" :model-value="error">
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

<script setup lang="ts">
import {
  BAlert,
  BButton,
  BDropdown,
  BDropdownItem,
  BFormCheckbox,
} from "bootstrap-vue-next";
import { useI18n } from "vue-i18n";
import { SlickItem, SlickList } from "vue-slicksort";

import { bookcase } from "~/stores/bookcase";
import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { images } from "~/stores/images";

const user = $computed(() => collection().user);
const getImagePath = images().getImagePath;
const { t: $t } = useI18n();
const bookcaseStore = bookcase();
const textures = [
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
];
const bookcaseOptions = $computed(() => bookcaseStore.bookcaseOptions);
const publicationNames = $computed(() => coa().publicationNames);
const textureTypes = $computed(
  () =>
    ({
      bookcase: $t("Sous-texture"),
      bookshelf: $t("Sous-texture de l'étagère"),
    } as { bookcase: string; bookshelf: string })
);

const loadData = async () => {
  await bookcaseStore.loadBookcaseOptions();
  await bookcaseStore.loadBookcaseOrder();
  loading = false;
};
const submit = async () => {
  error = false;
  loading = true;
  try {
    await bookcaseStore.updateBookcaseOptions();
    await bookcaseStore.updateBookcaseOrder();
    await loadData();
  } catch {
    error = true;
  } finally {
    loading = false;
  }
};
const textureWithoutSuperType = (texture: string) =>
  texture.replace(/^[^/]+\//, "");

let error = $ref(false as boolean);
let loading = $ref(true as boolean);
let hasPublicationNames = $ref(false as boolean);
let bookcaseOrder = $ref(null as string[] | null);

watch(
  () => user,
  async (value) => {
    if (value) {
      bookcaseStore.bookcaseUsername = value.username;
      await loadData();
      bookcaseOrder = bookcaseStore.bookcaseOrder;
      await coa().fetchPublicationNames(bookcaseOrder!);
      bookcaseOrder = (bookcaseOrder as string[]).filter((publicationcode) =>
        Object.keys(publicationNames).includes(publicationcode)
      );
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);
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
