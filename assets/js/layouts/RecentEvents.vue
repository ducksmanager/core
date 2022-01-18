<template>
  <div id="recently">
    <h4>{{ $t('Récemment sur DucksManager...') }}</h4>
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
      <span v-else>{{ $t('Chargement...') }}</span>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from "pinia";
import medalMixin from "../mixins/medalMixin";
import Ago from "../components/Ago";
import Event from "../components/Event";
import { users } from "../stores/users";
import { coa } from "../stores/coa";
import {ongoingRequests} from "../stores/ongoing-requests";

export default {
  name: "RecentEvents",

  components: {
    Event,
    Ago
  },
  mixins: [medalMixin],

  data: () => ({
    isLoaded: false,
    hasFreshEvents: false
  }),

  computed: {
    ...mapState(coa, ["publicationNames"]),
    ...mapState(users, ["stats", "points", "events"]),
    ...mapState(ongoingRequests, ["numberOfOngoingAjaxCalls"]),

    eventUserIds() {
      return this.events && this.events
        .reduce(
          (acc, event) => [...acc, event.userId || null, ...(event.users || [])],
          []
        )
        .filter(userId => !!userId)
    }
  },

  watch: {
    async numberOfOngoingAjaxCalls(newValue) {
      const vm = this
      if (newValue === 0) {
        setTimeout(async () => {
          if (!vm.hasFreshEvents && vm.numberOfOngoingAjaxCalls === 0) { // Still no ongoing call after 1 second
            await this.fetchEventsAndAssociatedData(true)
            this.hasFreshEvents = true
          }
        }, 1000)
      }
    }
  },

  async mounted() {
    await this.fetchEventsAndAssociatedData(false)
    this.isLoaded = true
  },

  methods: {
    ...mapActions(coa, ["fetchCountryNames", "fetchPublicationNames"]),
    ...mapActions(users, ["fetchEvents", "fetchStats"]),

    async fetchEventsAndAssociatedData(clearCacheEntry) {
      this.hasFreshEvents = await this.fetchEvents(clearCacheEntry)

      await this.fetchPublicationNames(
        this.events
          .filter(({publicationCode}) => publicationCode)
          .map(({publicationCode}) => publicationCode)
          .concat(
            this.events.filter(({edges}) => edges)
              .reduce((acc, {edges}) => ([...acc, ...edges.map(({publicationCode}) => publicationCode)]), [])
          )
      )

      await this.fetchStats(this.eventUserIds, clearCacheEntry)
    }
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
