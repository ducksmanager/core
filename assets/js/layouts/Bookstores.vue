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
          v-once
          :key="bookstore.id"
          :coordinates="[bookstore.coordY, bookstore.coordX]"
        >
          <MglPopup>
            <div>
              <h2>{{ bookstore.name }}</h2>
              <div>
                <p>{{ bookstore.comment }}</p>
                <p>{{ bookstore.address }}</p>
                <p>
                  {{ $t("Signalé par") }}
                  <span v-if="bookstore.username">{{ bookstore.username }}</span>
                  <span v-else>{{ $t("un visiteur anonyme") }}</span>
                  <span>{{ formatDate(bookstore.creationDate) }}</span>
                </p>
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
      id="form_bouquinerie"
      @submit.prevent="suggestBookstore"
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
        maxlength="1000"
        type="text"
        :placeholder="$t('Commentaires (ambiance, exemples de prix,...)')"
      />
      <b-btn type="submit">
        {{ $t("Ajouter la bouquinerie") }}
      </b-btn>
    </form>
  </div>
</template>
<script>
import { MglMap, MglMarker, MglPopup } from "vue-mapbox";
import l10nMixin from "../mixins/l10nMixin";
import axios from "axios";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

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
    MglPopup
  },

  mixins: [l10nMixin],

  data: () => ({
    accessToken: "pk.eyJ1IjoiYnBlcmVsIiwiYSI6ImNqbmhubHVrdDBlZ20zcG8zYnQydmZwMnkifQ.suaRi8ln1w_DDDlTlQH0vQ",
    mapCenter: [1.73584, 46.754917],
    bookstores: [],
    newBookstore,
    newBookstoreSent: false
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
    async fetchBookstores() {
      this.bookstores = (await axios.get("/bookstore/list")).data.map(bookstore => {
        ["name", "address", "comment"].forEach(field => {
          try {
            bookstore[field] = decodeURIComponent(escape(bookstore[field]));
          } catch (_) {
            console.warn(`Bookstore ${bookstore.id}: ${field} is not decodable`)
          }
        });
        return bookstore;
      }).filter(bookstore => !!bookstore);
    },
    async suggestBookstore() {
      if (!newBookstore.coordX) {
        window.alert(this.$t('Vous devez sélectionner une adresse dans la liste lorsque vous l\'entrez dans le champ "Adresse"'))
        return false
      }
      await axios.put("/bookstore/suggest", this.newBookstore);
      this.newBookstoreSent = true;
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
