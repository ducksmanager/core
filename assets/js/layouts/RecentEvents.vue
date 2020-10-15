<template>
  <div
    v-if="l10n"
    id="recemment"
  >
    <h4>{{ l10n.NEWS_TITRE }}</h4>
    <div id="evenements">
      <span v-if="events && userStats && publicationNames">
        <div
          v-for="event in events"
          :key="JSON.stringify(event)"
          :class="{evenement: true, [`evenement_${event.type}`]: true}"
        >
          <User
            v-if="event.userId"
            :id="event.userId"
            :stats="userStats.stats.find(({ID: userId}) => userId === event.userId)"
            :points="userStats.points.filter(({userId: currentUserId}) => event.userId === currentUserId)"
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
              v-if="publicationNames[event.publicationcode]"
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
import axios from "axios";
import * as timeago from "timeago.js";
import l10nMixin from "../mixins/l10nMixin";
import User from "../components/User";
import Issue from "../components/Issue";
import {mapActions, mapState} from "vuex";
import collectionMixin from "../mixins/collectionMixin";
import medalsMixin from "../mixins/medalsMixin";

export default {
  name: "RecentEvents",

  components: {
    User,
    Issue
  },
  mixins: [l10nMixin, collectionMixin, medalsMixin],

  data: () => ({
    events: null,
    userStats: null
  }),

  computed: {
    ...mapState("coa", ["publicationNames"]),
  },

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
        userId: parseInt(event.ID_Utilisateur)
      }
    }).sort(({timestamp: timestamp1}, {timestamp: timestamp2}) => timestamp1 < timestamp2)

    await this.fetchPublicationNames(
        this.events
            .filter(({publicationcode}) => publicationcode)
            .map(({publicationcode}) => publicationcode)
    )

    this.userStats = await this.getUserStats(this.events.map(({userId}) => userId))
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"])
  },
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