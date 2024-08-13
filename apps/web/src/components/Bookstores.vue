<template>
  <div>
    {{
      $t(
        "Cette page vous permet de trouver près de chez vous des bouquineries qui proposent fréquemment des magazines Disney.",
      )
    }}
    <br /><br />
    <div v-if="!bookstores">
      {{ $t("Chargement...") }}
    </div>
    <div v-else id="map">
      <mapbox-map
        :access-token="accessToken"
        map-style="mapbox://styles/mapbox/light-v10"
        :center="mapCenter"
        :zoom="4"
        @loaded="loaded = true"
      >
        <template v-if="loaded">
          <mapbox-marker
            v-for="currentBookstore in bookstores"
            :key="currentBookstore.id"
            :lng-lat="[currentBookstore.coordY, currentBookstore.coordX]"
            anchor="bottom"
            :offset="[0, 6]"
          >
            <mapbox-popup anchor="top">
              <div>
                <h2>{{ currentBookstore.name }}</h2>
                <div>
                  <p class="text-secondary">
                    {{ currentBookstore.address }}
                  </p>
                  <div
                    v-for="{
                      userId,
                      creationDate,
                      comment,
                    } in currentBookstore.comments.filter(
                      ({ creationDate }) => creationDate,
                    )"
                    :key="`bookstore-${currentBookstore.id}-comment-${creationDate}`"
                    class="mb-2"
                  >
                    <b v-if="userId && userStats[userId]">{{
                      userStats[userId].username
                    }}</b>
                    <span v-else>{{ $t("un visiteur anonyme") }}</span
                    >&nbsp;<i>{{ formatDate(creationDate) }}</i>
                    <blockquote class="px-3 clearfix">
                      {{ comment }}
                    </blockquote>
                  </div>
                  <b-alert
                    v-if="existingBookstoreSent"
                    variant="success"
                    :model-value="true"
                  >
                    {{ $t("Un e-mail vient d'être envoyé au webmaster.") }}
                    {{
                      $t(
                        "Si votre commentaire est valide, il sera ajouté sur le site très prochainement.",
                      )
                    }}
                    {{ $t("Merci pour votre contribution !") }}
                  </b-alert>
                  <form
                    v-else-if="existingBookstore"
                    class="mb-2"
                    @submit.prevent="suggestComment(currentBookstore)"
                  >
                    <b-form-textarea
                      v-model="
                        currentBookstore.comments[
                          currentBookstore.comments.length - 1
                        ].comment
                      "
                      required
                      cols="41"
                      rows="5"
                      minlength="50"
                      maxlength="1000"
                      type="text"
                      :placeholder="
                        $t('Commentaires (ambiance, exemples de prix,...)')
                      "
                    />
                    <b-button type="submit">
                      {{ $t("Ajouter un commentaire") }}
                    </b-button>
                    <b-button @click="existingBookstore = null">
                      {{ $t("Annuler") }}
                    </b-button>
                  </form>
                  <b-button
                    v-else
                    @click="initCommentOnExistingBookstore(currentBookstore)"
                  >
                    {{ $t("Ajouter un commentaire") }}
                  </b-button>
                </div>
              </div>
            </mapbox-popup>
          </mapbox-marker></template
        >
      </mapbox-map>
    </div>
    <br />
    <br />
    <h2>
      {{ $t("Proposer une bouquinerie") }}
    </h2>
    {{
      $t(
        "Vous connaissez une bouquinerie sympa ? Faites-en profiter d'autres collectionneurs !",
      )
    }}
    <br />
    {{
      $t(
        "Entrez ci-dessous les informations sur la bouquinerie que vous connaissez, puis entrez des exemples de prix de magazines.",
      )
    }}
    <br />
    {{
      $t(
        "Nous comptons sur votre honnêteté concernant les prix si vous en mentionnez.",
      )
    }}
    <br />
    <br />
    <b-alert v-if="newBookstoreSent" variant="success" :model-value="true">
      {{ $t("Un e-mail vient d'être envoyé au webmaster.") }}
      {{
        $t(
          "Si votre bouquinerie est valide, elle sera ajoutée sur le site très prochainement.",
        )
      }}
      {{ $t("Merci pour votre contribution !") }}
    </b-alert>
    <form v-else @submit.prevent="suggestComment(newBookstore)">
      <input v-model="newBookstore.coordX" type="hidden" />
      <input v-model="newBookstore.coordY" type="hidden" />
      <b-form-input
        v-model="newBookstore.name"
        required
        maxlength="25"
        type="text"
        :placeholder="$t('Nom de la bouquinerie')"
      />

      <div id="address" class="mb-2" />
      <b-form-textarea
        v-model="newBookstore.comments[0].comment"
        required
        cols="41"
        rows="5"
        minlength="50"
        maxlength="1000"
        type="text"
        :placeholder="$t('Commentaires (ambiance, exemples de prix,...)')"
      />
      <b-button type="submit">
        {{ $t("Ajouter la bouquinerie") }}
      </b-button>
    </form>
  </div>
</template>

<script setup lang="ts">
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { MapboxMap, MapboxMarker, MapboxPopup } from "vue-mapbox-ts";

import type { SimpleBookstore } from "~dm-types/SimpleBookstore";

import { dmSocketInjectionKey } from "../composables/useDmSocket";

const {
  bookstore: { services: bookstoreServices },
} = injectLocal(dmSocketInjectionKey)!;

const { fetchStats } = users();
const { stats: userStats } = storeToRefs(users());

let bookstores = $shallowRef<SimpleBookstore[] | null>(null);
let existingBookstore = $ref<SimpleBookstore | null>(null);
let newBookstoreSent = $ref(false);
let existingBookstoreSent = $ref(false);

const { t: $t } = useI18n();
let loaded = $ref(false);
const newBookstore = $ref<SimpleBookstore>({
  id: null,
  name: "",
  address: "",
  coordX: 0,
  coordY: 0,
  comments: [{ comment: "", userId: null, creationDate: null }],
});
const accessToken =
  "pk.eyJ1IjoiYnBlcmVsIiwiYSI6ImNqbmhubHVrdDBlZ20zcG8zYnQydmZwMnkifQ.suaRi8ln1w_DDDlTlQH0vQ";
const mapCenter = [1.73584, 46.754917];

const bookstoreCommentsUserIds = $computed(
  () =>
    bookstores?.reduce<number[]>(
      (acc, bookstore: SimpleBookstore) => [
        ...new Set([
          ...acc,
          ...bookstore.comments
            .map(({ userId }) => userId)
            .filter((userId): userId is number => userId !== null),
        ]),
      ],
      [],
    ) || null,
);

const decodeText = (value: string) => {
  try {
    return decodeURIComponent(escape(value));
  } catch (_e) {
    return value;
  }
};
const fetchBookstores = async () => {
  bookstores = (await bookstoreServices.getActiveBookstores())
    .map((bookstore) => {
      bookstore.name = decodeText(bookstore.name);
      bookstore.address = decodeText(bookstore.address);
      bookstore.comments.forEach((comment, commentNumber) => {
        bookstore.comments[commentNumber].comment = decodeText(comment.comment);
      });
      return bookstore;
    })
    .filter((bookstore) => !!bookstore);
};
const suggestComment = async (bookstore: SimpleBookstore) => {
  if (!bookstore.id && !bookstore.coordX) {
    window.alert(
      $t(
        'Vous devez sélectionner une adresse dans la liste lorsque vous l\'entrez dans le champ "Adresse"',
      ),
    );
    return false;
  }
  await bookstoreServices.createBookstoreComment(bookstore);
  if (bookstore.id) {
    existingBookstoreSent = true;
    existingBookstore = null;
  } else {
    newBookstoreSent = true;
  }
};
const formatDate = (date: Date | null) =>
  date === null
    ? $t("il y a longtemps")
    : $t("le {date}", {
        date: new Date(date).toLocaleDateString(),
      });

const initCommentOnExistingBookstore = (bookstore: SimpleBookstore) => {
  existingBookstore = bookstore;
  if (!existingBookstore!.comments.some(({ comment }) => !comment)) {
    existingBookstore!.comments.push({
      comment: "",
      creationDate: null,
      userId: null,
    });
  }
};

watch(
  $$(bookstoreCommentsUserIds),
  async (value) => {
    if (value) {
      await fetchStats(value);
    }
  },
  { immediate: true },
);

const geocoder = new MapboxGeocoder({
  accessToken,
  placeholder: $t("Adresse"),
  types: "address",
  proximity: { latitude: 46.754917, longitude: 1.73584 },
  enableEventLogging: false,
});

onMounted(async () => {
  await fetchBookstores();
  geocoder.addTo("#address");
  let element = window.document.querySelector(".mapboxgl-ctrl-geocoder--input");
  if (element as HTMLElement) {
    element!.setAttribute("required", "true");
  }
  geocoder.on("result", ({ result: { place_name, center } }) => {
    newBookstore.address = place_name;
    [newBookstore.coordY, newBookstore.coordX] = center;
  });
});
</script>

<style lang="scss">
#map {
  height: 500px;

  .mapboxgl-marker {
    cursor: pointer;
  }

  .mapboxgl-popup-content {
    color: black;
  }
}

#address {
  z-index: 1;
  width: 100%;
  text-align: left;
  top: 20px;

  svg {
    display: none;
  }

  .mapboxgl-ctrl-geocoder {
    min-width: 100%;

    .mapboxgl-ctrl-geocoder--input {
      width: 100%;
      height: initial;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
    }

    .suggestions-wrapper {
      position: absolute;
      width: 100%;
      margin-top: -5px;

      ul.suggestions {
        list-style-type: none;

        li {
          background: #ddd;
          color: black;
          padding: 5px;
          border: 1px solid white;
          min-width: 250px;
          cursor: pointer;
        }
      }
    }

    .mapboxgl-ctrl-geocoder--pin-right {
      display: none;
    }
  }
}
</style>
