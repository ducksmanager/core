<template>
  <div id="recently">
    <h4>{{ $t("Récemment sur DucksManager...") }}</h4>
    <div>
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

<script setup lang="ts">
import { onMounted } from "vue";

import { coa } from "~/stores/coa";
import { users } from "~/stores/users";
import { AbstractEvent } from "~types/events/AbstractEvent";
import { CollectionUpdateEvent } from "~types/events/CollectionUpdateEvent";
import { EdgeCreationEvent } from "~types/events/EdgeCreationEvent";

let isLoaded = $ref(false as boolean);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hasFreshEvents = $ref(false as boolean);
const events = $computed(() => users().events);
const eventUserIds = $computed(() =>
  events
    ?.reduce((acc, event) => [...acc, ...(event.users || [])], [] as number[])
    .filter((userId) => !!userId)
);
const fetchPublicationNames = coa().fetchPublicationNames;
const fetchEvents = users().fetchEvents;
const fetchStats = users().fetchStats;

const isCollectionUpdateEvent = (event: AbstractEvent) =>
  event.hasOwnProperty("numberOfIssues");

const isEdgeCreationEvent = (event: AbstractEvent) =>
  event.hasOwnProperty("edges");

const fetchEventsAndAssociatedData = async (clearCacheEntry: boolean) => {
  hasFreshEvents = await fetchEvents(clearCacheEntry);

  await fetchPublicationNames([
    ...events
      .filter((event) => isCollectionUpdateEvent(event))
      .map((event) => (event as CollectionUpdateEvent).publicationcode || ""),
    ...events
      .filter((event) => isEdgeCreationEvent(event))
      .map((event) => event as EdgeCreationEvent)
      .reduce(
        (acc, { edges }) => [
          ...acc,
          ...edges.map(({ publicationcode }) => publicationcode),
        ],
        [] as string[]
      ),
  ]);

  await fetchStats(eventUserIds, clearCacheEntry);
};

onMounted(async () => {
  await fetchEventsAndAssociatedData(false);
  setTimeout(async () => {
    await fetchEventsAndAssociatedData(true);
    hasFreshEvents = true;
  }, 1000);
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
