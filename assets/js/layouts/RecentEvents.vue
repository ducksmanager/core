<template>
  <div id="recently">
    <h4>{{ $t("Récemment sur DucksManager...") }}</h4>
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
      <span v-else>{{ $t("Chargement...") }}</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";

import Ago from "../components/Ago";
import Event from "../components/Event";
import { coa } from "../stores/coa";
import { ongoingRequests } from "../stores/ongoing-requests";
import { users } from "../stores/users";

let isLoaded = $ref(false),
  hasFreshEvents = $ref(false);
const publicationNames = $computed(() => coa().publicationNames),
  stats = $computed(() => users().stats),
  points = $computed(() => users().points),
  events = $computed(() => users().events),
  numberOfOngoingAjaxCalls = $computed(
    () => ongoingRequests().numberOfOngoingAjaxCalls
  ),
  eventUserIds = $computed(() =>
    events
      ?.reduce(
        (acc, event) => [...acc, event.userId || null, ...(event.users || [])],
        []
      )
      .filter((userId) => !!userId)
  ),
  fetchPublicationNames = coa().fetchPublicationNames,
  fetchEvents = users().fetchEvents,
  fetchStats = users().fetchStats,
  fetchEventsAndAssociatedData = async (clearCacheEntry) => {
    hasFreshEvents = await fetchEvents(clearCacheEntry);

    await fetchPublicationNames(
      events
        .filter(({ publicationCode }) => publicationCode)
        .map(({ publicationCode }) => publicationCode)
        .concat(
          events
            .filter(({ edges }) => edges)
            .reduce(
              (acc, { edges }) => [
                ...acc,
                ...edges.map(({ publicationCode }) => publicationCode),
              ],
              []
            )
        )
    );

    await fetchStats(eventUserIds, clearCacheEntry);
  };

watch(
  () => numberOfOngoingAjaxCalls,
  async (newValue) => {
    if (newValue === 0) {
      setTimeout(async () => {
        if (!hasFreshEvents && numberOfOngoingAjaxCalls === 0) {
          // Still no ongoing call after 1 second
          await fetchEventsAndAssociatedData(true);
          hasFreshEvents = true;
        }
      }, 1000);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchEventsAndAssociatedData(false);
  isLoaded = true;
});
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
    display: none;
  }
}
</style>
