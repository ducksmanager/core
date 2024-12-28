<template>
  <div
    class="position-absolute"
    :class="`${topCenter ? 'top-0 mt-1' : 'end-0 me-1'}`"
  >
    <Teleport to="body">
      <b-popover
        lazy
        :target="id"
        interactive
        @shown="emit('toggled', true)"
        @hidden="emit('toggled', false)"
        ><slot
      /></b-popover>
    </Teleport>
    <AiSuggestionIcon
      :id="disabled ? `${id}-disabled` : id"
      button
      :is-loading="isLoading"
      :status="status"
    />
  </div>
</template>
<script setup lang="ts" generic="LoadingEventStart extends keyof ServerSentStartEvents">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { ServerSentStartEvents } from "~dumili-services/indexation/types";

const { status, loadingEvents = [] } = defineProps<{
  id: string;
  status: "success" | "failure" | "idle";
  topCenter?: boolean;
  loadingEvents?: {
    eventName: LoadingEventStart;
    checkMatch: (
      ...args: Parameters<ServerSentStartEvents[LoadingEventStart]>
    ) => boolean;
  }[];
}>();

defineSlots();

const emit = defineEmits<{
  (e: "toggled", toggle: boolean): void;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const isLoading = ref(false);
const disabled = ref(false); // TODO handle failed suggestions

watch(
  indexationSocket,
  (socket) => {
    if (socket) {
      for (const loadingEvent of loadingEvents) {
        indexationSocket.value!.on(loadingEvent.eventName, (...args) => {
          if (loadingEvent.checkMatch(...args)) {
            isLoading.value = true;
          }
        });

        const endEvent: `${LoadingEventStart}End` = `${loadingEvent.eventName}End`;

        indexationSocket.value!.on(endEvent, (...args) => {
          if (loadingEvent.checkMatch(...args)) {
            setTimeout(() => {
              isLoading.value = false;
            }, 1500);
          }
        });
      }
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
span > svg {
  width: 20px;
  height: 20px;
  color: black;
  cursor: pointer;
}
</style>