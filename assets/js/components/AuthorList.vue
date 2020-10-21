<template>
  <div v-if="watchedAuthors.length">
    {{ l10n.LISTE_AUTEURS_INTRO }}
    <ul v-if="personNames">
      <li
        v-for="author in watchedAuthors"
        :key="author.personCode"
      >
        <div>{{ personNames[author.personCode] }}</div>
        <div>
          <b-form-rating
            v-model="author.notation"
            :stars="10"
            @change="updateRating(author)"
          />
        </div>
        <div @click="deleteAuthor(author)">
          <a href="javascript:void 0">{{ l10n.SUPPRIMER }}</a>
        </div>
      </li>
    </ul>
  </div>
  <b-alert
    v-else-if="l10n"
    variant="show"
  >
    {{ l10n.AUCUN_AUTEUR_NOTE_1 }}
    {{ l10n.AUCUN_AUTEUR_NOTE_2_MEME_PAGE }}
    {{ l10n.AUCUN_AUTEUR_NOTE_3 }}
  </b-alert>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapState} from "vuex";
import axios from "axios";

export default {
  name: "AuthorList",
  mixins: [l10nMixin],
  props: {
    watchedAuthors: {
      type: Array,
      required: true
    }
  },

  computed: {
    ...mapState("coa", ["personNames"])
  },

  mounted() {
    this.fetchPersonNames(this.watchedAuthors.map(({personCode}) => personCode))
  },

  methods: {
    ...mapActions("coa", ["fetchPersonNames"]),
    ...mapActions("collection", ["loadWatchedAuthors"]),
    async updateRating(author) {
      console.log('Update rating for ' + author)
      await axios.post('/api/collection/authors/watched', author)
    },
    async deleteAuthor(author) {
      console.log('Delete ' + JSON.stringify(author))
      await axios.delete('/api/collection/authors/watched', {
        params: {
          personCode: author.personCode
        }
      })
      await this.loadWatchedAuthors(true)
    }
  }
}
</script>

<style scoped lang="scss">
ul li div {
  display: inline-block;
  width: 200px;
}
</style>