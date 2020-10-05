<template>
  <div
    v-if="l10n"
    id="recemment"
  >
    <h4>{{ l10n.NEWS_TITRE }}</h4>
    <div id="evenements">
      <span v-if="events && publicationNames">
        <div
          v-for="event in events"
          :key="JSON.stringify(event)"
          :class="{evenement: true, [`evenement_${event.type}`]: true}"
        >
          <User
            v-if="event.ID_Utilisateur"
            :id="event.ID_Utilisateur"
          />
          <template v-if="event.type === 'signup'">
            {{ l10n.NEWS_A_COMMENCE_COLLECTION }}
          </template>
          <template v-if="event.type === 'medal'">
            {{
              $t('NEWS_A_OBTENU_MEDAILLE', $t(`TITRE_MEDAILLE_${event.contribution.toUpperCase()}`), [event.niveau])
            }}
          </template>
          <template v-if="event.type === 'bookstore'">
            {{ l10n.NEWS_A_AJOUTE_BOUQUINERIE }}
            <i><a href="?action=bouquineries">{{ event.nom_bouquinerie }}</a></i>
          </template>
          <template v-if="event.type === 'collection_update'">
            {{ l10n.NEWS_A_AJOUTE }}
            <Issue
              :publicationname="publicationNames[event.publicationcode]"
              :publicationcode="event.publicationcode"
              :issuenumber="event.issuenumber"
            />
            <template v-if="event.cpt > 1">
              {{ l10n.ET }} {{ event.cpt }}
              <template v-if="event.cpt > 2">{{ l10n.NEWS_AUTRES_NUMEROS }}</template>
              <template v-else>{{ l10n.NEWS_AUTRE_NUMERO }}</template>
            </template>
            {{ l10n.NEWS_A_SA_COLLECTION }}
          </template>
          <span class="date">{{ event.ago }}</span>
        </div>
      </span>
      <span v-else>{{ l10n.CHARGEMENT }}</span>
    </div>
  </div>
</template>

<script>
import coaMixin from "../mixins/coaMixin";
import axios from "axios";
import * as timeago from "timeago.js";
import l10nMixin from "../mixins/l10nMixin";
import User from "../components/User";
import Issue from "../components/Issue";

export default {
  name: "RecentEvents",

  components: {
    User,
    Issue
  },
  mixins: [l10nMixin, coaMixin],

  data: () => ({
    events: null,
    publicationNames: null
  }),

  async mounted() {
    this.events = (await axios.get('/events')).data.map(event => {
      if (event.Numero_Exemple) {
        const [publicationcode, issuenumber] = event.Numero_Exemple.split(/\/(?=[^/]+$)/)
        event = {...event, publicationcode, issuenumber}
      }

      return {
        ...event,
        cpt: event.cpt && parseInt(event.cpt),
        ago: timeago.format(parseInt(event.timestamp) * 1000),
        ID_Utilisateur: parseInt(event.ID_Utilisateur)
      }
    }).sort((a, b) => a.timestamp < b.timestamp)
    this.publicationNames = await this.getPublicationNames(
        [...new Set(this.events
            .filter(event => event.publicationcode)
            .map(event => event.publicationcode))]
    )
  }
}
</script>

<style scoped lang="scss">
#recemment {
  position: absolute;
  top: 450px;
  padding: 5px 5px 20px 5px;
  border-top: 1px solid #23282e;

  h4 {
    margin-left: 15px;
    margin-top: 0;
    white-space: nowrap;
  }

  #evenements div.evenement {
    margin-top: 12px;

    .date {
      color: grey;
      float: right;
    }
  }
}
</style>