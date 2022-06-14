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
import { onMounted } from "vue";

import { coa } from "../stores/coa";
import { users } from "../stores/users";
import Ago from "./Ago";
import Event from "./Event";

let isLoaded = $ref(false);
const events = $computed(() => users().events);
const eventUserIds = $computed(() =>
  events
    ?.reduce(
      (acc, event) => [...acc, event.userId || null, ...(event.users || [])],
      []
    )
    .filter((userId) => !!userId)
);
const fetchPublicationNames = coa().fetchPublicationNames;
const fetchStats = users().fetchStats;
const fetchEvents = users().fetchEvents;
const fetchEventsAndAssociatedData = async (clearCacheEntry) => {
  isLoaded = false;
  await fetchEvents(clearCacheEntry);
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
  isLoaded = true;
};

onMounted(async () => {
  // await fetchEventsAndAssociatedData(false);
  // setTimeout(async () => {
  await fetchEventsAndAssociatedData(true);
  // }, 1000);
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
