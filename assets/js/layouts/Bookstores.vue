<template>
  <div v-if="l10n">
    <h2>{{ l10n.LISTE_BOUQUINERIES }}</h2>
    {{ l10n.INTRO_BOUQUINERIES }}
    <br><br>
    <div id="map">
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
          showed
        >
          <MglPopup>
            <div>
              <h2>{{ bookstore.name }}</h2>
              <div>
                <p>{{ bookstore.comment }}</p>
                <p>{{ bookstore.address }}</p>
                <p>
                  {{ l10n.SIGNALE_PAR }}
                  <span v-if="bookstore.username">{{ bookstore.username }}</span>
                  <span v-else>{{ l10n.UN_VISITEUR_ANONYME }}</span>
                </p>
              </div>
            </div>
          </MglPopup>
        </MglMarker>
      </MglMap>
    </div>
    <br> <br>
    <h2>
      {{ l10n.PROPOSER_BOUQUINERIE }}
    </h2>
    {{ l10n.PRESENTATION_BOUQUINERIE1 }}
    <br>
    {{ l10n.INTRO_NOUVELLE_BOUQUINERIE }}
    <br>
    {{ l10n.PRIX_HONNETES }}
    <br> <br>
    <form
      id="form_bouquinerie"
      method="post"
      action="?action=bouquineries"
    >
      <b-form-input
        v-model="newBookstore.name"
        required
        maxlength="25"
        name="nom"
        type="text"
        :placeholder="l10n.NOM_BOUQUINERIE"
      />
      <b-form-input
        v-model="newBookstore.address"
        required
        name="full-address"
        type="text"
        :placeholder="l10n.ADRESSE"
      />
      <b-form-textarea
        v-model="newBookstore.comment"
        required
        cols="41"
        rows="5"
        maxlength="25"
        name="comments"
        type="text"
        :placeholder="l10n.COMMENTAIRES_BOUQUINERIE"
      />
      <b-btn @click="suggestBookstore">
        {{ l10n.AJOUTER_BOUQUINERIE }}
      </b-btn>
      <b-alert variant="info">
        {{ l10n.EMAIL_ENVOYE }} {{ l10n.EMAIL_ENVOYE_BOUQUINERIE }} {{ l10n.MERCI_CONTRIBUTION }} ?>
      </b-alert>
    </form>
  </div>
</template>
<script>
import {MglMap, MglMarker, MglPopup} from "vue-mapbox";
import l10nMixin from "../mixins/l10nMixin";
import axios from "axios";

const newBookstore = {
  name: null,
  address: null,
  comment: null,
  coordX: null,
  coordY: null
}

export default {
  name: "Bookstores",

  components: {
    MglMap,
    MglMarker,
    MglPopup
  },

  mixins: [l10nMixin],

  data: () => ({
    accessToken: 'pk.eyJ1IjoiYnBlcmVsIiwiYSI6ImNqbmhubHVrdDBlZ20zcG8zYnQydmZwMnkifQ.suaRi8ln1w_DDDlTlQH0vQ',
    mapCenter: [1.73584, 46.754917],
    bookstores: [],
    newBookstore
  }),

  async mounted() {
    await this.fetchBookstores()
  },

  methods: {
    async fetchBookstores() {
      this.bookstores = (await axios.get('/bookstore/list')).data.map(bookstore => {
        debugger
        ['name', 'address', 'comment'].forEach(field => {
          console.log(field + '=' + bookstore[field])
          bookstore[field] = decodeURIComponent(escape(bookstore[field]))
        })
        return bookstore
      })
    },
    async suggestBookstore() {
      await axios.put('/bookstore/suggest', this.newBookstore)
      this.newBookstore = newBookstore
    }
  }
}
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
</style>