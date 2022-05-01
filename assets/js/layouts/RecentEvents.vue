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
import Ago from "../components/Ago";
import Event from "../components/Event";
import { users } from "../stores/users";
import { coa } from "../stores/coa";
import { ongoingRequests } from "../stores/ongoing-requests";
import { computed, onMounted, watch, ref } from "vue";

const isLoaded = ref(false),
  hasFreshEvents = ref(false),
  publicationNames = computed(() => coa().publicationNames),
  stats = computed(() => users().stats),
  points = computed(() => users().points),
  events = computed(() => users().events),
  numberOfOngoingAjaxCalls = computed(
    () => ongoingRequests().numberOfOngoingAjaxCalls
  ),
  eventUserIds = computed(() =>
    events.value
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
    hasFreshEvents.value = await fetchEvents(clearCacheEntry);

    await fetchPublicationNames(
      events.value
        .filter(({ publicationCode }) => publicationCode)
        .map(({ publicationCode }) => publicationCode)
        .concat(
          events.value
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

    await fetchStats(eventUserIds.value, clearCacheEntry);
  };

watch(
  () => numberOfOngoingAjaxCalls.value,
  async (newValue) => {
    if (newValue === 0) {
      setTimeout(async () => {
        if (!hasFreshEvents.value && numberOfOngoingAjaxCalls.value === 0) {
          // Still no ongoing call after 1 second
          await fetchEventsAndAssociatedData(true);
          hasFreshEvents.value = true;
        }
      }, 1000);
    }
  }, { immediate: true}
);

onMounted(async () => {
  await fetchEventsAndAssociatedData(false);
  isLoaded.value = true;
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
