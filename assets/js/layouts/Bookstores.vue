<template>
  <div>
    {{ $t("Cette page vous permet de trouver près de chez vous des bouquineries qui proposent fréquemment des magazines Disney.")
    }}
    <br><br>
    <div v-if="!bookstores.length">
      {{ $t("Chargement...") }}
    </div>
    <div
      v-else
      id="map"
    >
      <MglMap
        :access-token="accessToken"
        map-style="mapbox://styles/mapbox/light-v10"
        :center="mapCenter"
        :zoom="4"
      >
        <MglMarker
          v-for="bookstore in bookstores"
          :key="bookstore.id"
          :coordinates="[bookstore.coordY, bookstore.coordX]"
          anchor="bottom"
          :offset="[0,6]"
        >
          <MglPopup>
            <div>
              <h2>{{ bookstore.name }}</h2>
              <div>
                <p class="text-secondary">
                  {{ bookstore.address }}
                </p>
                <div
                  v-for="{username, creationDate, comment} in bookstore.comments"
                  :key="`bookstore-${bookstore.id}-comment-${creationDate}`"
                  class="mb-2"
                >
                  <b v-if="username">{{ username }}</b>
                  <span v-else>{{ $t("un visiteur anonyme") }}</span>
                  <i class="float-right">{{ formatDate(creationDate) }}</i>
                  <blockquote class="px-3 clearfix">
                    {{ comment }}
                  </blockquote>
                </div>
                <b-alert
                  v-if="existingBookstoreSent"
                  variant="success"
                  show
                >
                  {{ $t("Un e-mail vient d'être envoyé au webmaster.") }}
                  {{ $t("Si votre commentaire est valide, il sera ajouté sur le site très prochainement.") }}
                  {{ $t("Merci pour votre contribution !") }}
                </b-alert>
                <form
                  v-else-if="existingBookstore"
                  class="mb-2"
                  @submit.prevent="suggestComment(bookstore)"
                >
                  <b-form-textarea
                    v-model="bookstore.comment"
                    required
                    cols="41"
                    rows="5"
                    minlength="50"
                    maxlength="1000"
                    type="text"
                    :placeholder="$t('Commentaires (ambiance, exemples de prix,...)')"
                  />
                  <b-button
                    type="submit"
                  >
                    {{ $t("Ajouter un commentaire") }}
                  </b-button>
                  <b-button @click="existingBookstore = null">
                    {{ $t("Annuler") }}
                  </b-button>
                </form>
                <a
                  v-else
                  href="javascript:void(0)"
                  @click="existingBookstore = bookstore"
                >{{ $t("Ajouter un commentaire") }}</a>
              </div>
            </div>
          </MglPopup>
        </MglMarker>
      </MglMap>
    </div>
    <br> <br>
    <h2>
      {{ $t("Proposer une bouquinerie") }}
    </h2>
    {{ $t("Vous connaissez une bouquinerie sympa ? Faites-en profiter d'autres collectionneurs !") }}
    <br>
    {{ $t("Entrez ci-dessous les informations sur la bouquinerie que vous connaissez, puis entrez des exemples de prix de magazines.")
    }}
    <br>
    {{ $t("Nous comptons sur votre honnêteté concernant les prix si vous en mentionnez.") }}
    <br> <br>
    <b-alert
      v-if="newBookstoreSent"
      variant="success"
      show
    >
      {{ $t("Un e-mail vient d'être envoyé au webmaster.") }}
      {{ $t("Si votre bouquinerie est valide, elle sera ajoutée sur le site très prochainement.") }}
      {{ $t("Merci pour votre contribution !") }}
    </b-alert>
    <form
      v-else
      @submit.prevent="suggestComment(newBookstore)"
    >
      <input
        v-model="newBookstore.coordX"
        type="hidden"
      >
      <input
        v-model="newBookstore.coordY"
        type="hidden"
      >
      <b-form-input
        v-model="newBookstore.name"
        required
        maxlength="25"
        type="text"
        :placeholder="$t('Nom de la bouquinerie')"
      />

      <div
        id="address"
        class="mb-2"
      />
      <b-form-textarea
        v-model="newBookstore.comment"
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
<script>
import { MglMap, MglMarker, MglPopup } from "vue-mapbox";
import axios from "axios";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import {BAlert, BButton, BFormInput, BFormTextarea} from "bootstrap-vue-3";

const newBookstore = {
  name: null,
  address: null,
  comment: null,
  coordX: null,
  coordY: null
};

export default {
  name: "Bookstores",

  components: {
    MglMap,
    MglMarker,
    MglPopup,
    BAlert,
    BFormTextarea,
    BButton,
    BFormInput
  },


  data: () => ({
    accessToken: "pk.eyJ1IjoiYnBlcmVsIiwiYSI6ImNqbmhubHVrdDBlZ20zcG8zYnQydmZwMnkifQ.suaRi8ln1w_DDDlTlQH0vQ",
    mapCenter: [1.73584, 46.754917],
    bookstores: [],
    newBookstore,
    existingBookstore: null,
    newBookstoreSent: false,
    existingBookstoreSent: false
  }),

  async mounted() {
    const vm = this;
    await this.fetchBookstores();
    const geocoder = new MapboxGeocoder({
      accessToken: this.accessToken,
      placeholder: this.$t("Adresse"),
      types: "address",
      proximity: { latitude: 46.754917, longitude: 1.73584 },
      enableEventLogging: false
    });
    geocoder.addTo("#address");
    window.document.querySelector('.mapboxgl-ctrl-geocoder--input').attributes.required = true
    geocoder.on("result", ({ result: { place_name, center } }) => {
      vm.newBookstore.address = place_name
      ;[vm.newBookstore.coordY, vm.newBookstore.coordX] = center;
    });
  },

  methods: {
    decodeText(object, field) {
      try {
        return decodeURIComponent(escape(object[field]));
      } catch (_) {
        return object[field];
      }
    },
    async fetchBookstores() {
      this.bookstores = (await axios.get("/bookstoreComment/list")).data.map(bookstore => {
        ["name", "address"].forEach(field => {
          bookstore[field] = this.decodeText(bookstore, field);
        });
        bookstore.comments.forEach((comment, commentNumber) => {
          ["comment"].forEach(field => {
            bookstore.comments[commentNumber][field] = this.decodeText(comment, field);
          });
        })
        return bookstore;
      }).filter(bookstore => !!bookstore);
    },
    async suggestComment(bookstore) {
      if (!bookstore.id && !bookstore.coordX) {
        window.alert(this.$t('Vous devez sélectionner une adresse dans la liste lorsque vous l\'entrez dans le champ "Adresse"'))
        return false
      }
      await axios.put("/bookstoreComment/suggest", bookstore);
      if (bookstore.id) {
        this.existingBookstoreSent = true;
        this.existingBookstore = null
      }
      else {
        this.newBookstoreSent = true;
      }
    },
    formatDate(date) {
      if (date == null) {
        return this.$t("il y a longtemps");
      }
      else {
        return this.$t("le {date}", { date: new Date(date).toLocaleDateString() });
      }
    }
  }
};
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
    }

    .suggestions-wrapper {
      position: absolute;
      margin-top: -5px;

      ul.suggestions {
        list-style-type: none;
        padding: 5px 0;

        li {
          background: #ddd;
          color: black;
          padding: 5px;
          border: 1px solid white;
          width: 50%;
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
