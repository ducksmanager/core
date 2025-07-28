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
import type { AbstractEvent } from "~dm-types/events/AbstractEvent";
import type { CollectionSubscriptionAdditionEvent } from "~dm-types/events/CollectionSubscriptionAdditionEvent";
import type { CollectionUpdateEvent } from "~dm-types/events/CollectionUpdateEvent";
import type { EdgeCreationEvent } from "~dm-types/events/EdgeCreationEvent";

const { fetchStats, fetchEvents } = users();
const { events } = storeToRefs(users());

const { fetchPublicationNames, fetchIssuecodeDetails } = coa();
const { issuecodeDetails } = storeToRefs(coa());

let isLoaded = $ref(false);
const eventUserIds = $computed(() =>
  events.value
    ?.reduce<
      (number | null)[]
    >((acc, event) => [...acc, ...(event.users || [])], [])
    .filter((userId) => !!userId),
);
const isCollectionUpdateEvent = (
  event: AbstractEvent,
): event is CollectionUpdateEvent => event.type === "collection_update";

const isEdgeCreationEvent = (
  event: AbstractEvent,
): event is EdgeCreationEvent => event.type === "edge";

const isCollectionSubscriptionAdditionEvent = (
  event: AbstractEvent,
): event is CollectionSubscriptionAdditionEvent =>
  event.type === "subscription_additions";

const fetchEventsAndAssociatedData = async () => {
  await fetchEvents();

  await fetchIssuecodeDetails(
    [
      events.value
        .filter((event) => isCollectionUpdateEvent(event))
        .map(({ exampleIssuecode }) => exampleIssuecode),
      events.value
        .filter((event) => isCollectionSubscriptionAdditionEvent(event))
        .reduce<string[]>((acc, { issuecode }) => [...acc, issuecode], []),
      events.value
        .filter((event) => isEdgeCreationEvent(event))
        .reduce<string[]>((acc, { issuecodes }) => [...acc, ...issuecodes], []),
    ].flat(),
  );

  await fetchPublicationNames([
    ...events.value
      .filter((event) => isCollectionUpdateEvent(event))
      .map(
        (event) =>
          issuecodeDetails.value[event.exampleIssuecode].publicationcode || "",
      ),
    ...events.value
      .filter((event) => isEdgeCreationEvent(event))
      .reduce<
        string[]
      >((acc, { issuecodes }) => [...acc, ...issuecodes.map((issuecode) => issuecodeDetails.value[issuecode].publicationcode)], []),
  ]);

  await fetchStats(eventUserIds.filter((userId) => userId !== null));
};

(async () => {
  await fetchEventsAndAssociatedData();
  isLoaded = true;
})();
</script>

<style scoped lang="scss">
#recently {
  position: absolute;
  top: 550px;
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
