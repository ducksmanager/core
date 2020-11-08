<template>
  <div
    v-if="l10n"
    id="recently"
  >
    <h4>{{ l10n.NEWS_TITRE }}</h4>
    <div id="events">
      <template v-if="((events && publicationNames) || (events && !events.length)) && stats && points">
        <div
          v-for="event in events"
          :key="JSON.stringify(event)"
          :class="{event: true, [`event_${event.type}`]: true}"
        >
          <UserPopover
            v-if="event.userId && stats[event.userId]"
            :id="event.userId"
            :stats="stats[event.userId]"
            :points="points[event.userId]"
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
              hide-condition
            />
            <template v-if="event.cpt > 1">
              {{ l10n.ET }} {{ event.cpt }}
              <template v-if="event.cpt > 2">
                {{ l10n.NEWS_AUTRES_NUMEROS }}
              </template>
              <template v-else>
                {{ l10n.NEWS_AUTRE_NUMERO }}
              </template>
            </template>
            {{ l10n.NEWS_A_SA_COLLECTION }}
          </template>
          <Ago :timestamp="event.timestamp" />
        </div>
      </template>
      <span v-else>{{ l10n.CHARGEMENT }}</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import l10nMixin from "../mixins/l10nMixin";
import UserPopover from "../components/UserPopover";
import Issue from "../components/Issue";
import {mapActions, mapState} from "vuex";
import medalMixin from "../mixins/medalMixin";
import Ago from "./Ago";

export default {
  name: "RecentEvents",

  components: {
    Ago,
    UserPopover,
    Issue
  },
  mixins: [l10nMixin, medalMixin],

  data: () => ({
    events: null
  }),

  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapState("users", ["stats", "points"]),
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
        timestamp: parseInt(event.timestamp),
        userId: parseInt(event.ID_Utilisateur)
      }
    }).sort(({timestamp: timestamp1}, {timestamp: timestamp2}) => timestamp1 < timestamp2)

    await this.fetchPublicationNames(
      this.events
        .filter(({publicationcode}) => publicationcode)
        .map(({publicationcode}) => publicationcode)
    )

    await this.fetchStats(this.events.map(({userId}) => userId))
  },

  methods: {
    ...mapActions("coa", ["fetchCountryNames", "fetchPublicationNames"]),
    ...mapActions("users", ["fetchStats"])
  },
}
</script>

<style scoped lang="scss">
#recently {
  position: absolute;
  top: 450px;
  padding: 5px 5px 20px 5px;
  border-top: 1px solid #23282e;

  h4 {
    margin-left: 15px;
    margin-top: 0;
    white-space: nowrap;
  }

  #events div.event {
    margin-top: 12px;

  }
}

@media (max-width: 767px) {
  #recently {
    display: none
  }
}
</style>