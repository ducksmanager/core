<template>
  <div id="recently">
    <h4>{{ l10n.NEWS_TITRE }}</h4>
    <div id="events">
      <template v-if="isLoaded">
        <Event
          v-for="event in events"
          :key="JSON.stringify(event)"
          :event="event"
        >
          <Ago :timestamp="event.timestamp" />
        </Event>
      </template>
      <span v-else>{{ l10n.CHARGEMENT }}</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapState} from "vuex";
import medalMixin from "../mixins/medalMixin";
import Ago from "../components/Ago";
import Event from "../components/Event";

export default {
  name: "RecentEvents",

  components: {
    Event,
    Ago
  },
  mixins: [l10nMixin, medalMixin],

  data: () => ({
    events: null,
    isLoaded: false
  }),

  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapState("users", ["stats", "points"]),
  },

  async mounted() {
    this.events = (await axios.get('/events')).data.map(event => {
      if (event.exampleIssue) {
        const [publicationcode, issuenumber] = event.exampleIssue.split(/\/(?=[^/]+$)/)
        event = {...event, publicationcode, issuenumber}
      }
      if (event.collaborators) {
        event = {...event, collaborators: event.collaborators.split(',').map(userId => parseInt(userId))}
      }
      if (event.userId) {
        event.userId = parseInt(event.userId)
      }
      if (event.edges) {
        event.edges = JSON.parse(event.edges)
      }

      return {
        ...event,
        numberOfIssues: event.numberOfIssues && parseInt(event.numberOfIssues),
        timestamp: parseInt(event.timestamp),
      }
    }).sort(({timestamp: timestamp1}, {timestamp: timestamp2}) => timestamp1 < timestamp2)

    await this.fetchPublicationNames(
      this.events
        .filter(({publicationcode}) => publicationcode)
        .map(({publicationcode}) => publicationcode)
    )

    await this.fetchStats(this.events
      .reduce((acc, event) =>
        [...acc, event.userId || null, ...(event.collaborators || [])]
        , []
      )
      .filter(userId => !!userId)
    )
    this.isLoaded = true
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
}

@media (max-width: 767px) {
  #recently {
    display: none
  }
}
</style>