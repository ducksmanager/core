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
<script setup lang="ts" generic="LoadingEventStart extends keyof IndexationServerSentStartEvents">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { IndexationServerSentStartEvents } from "~dumili-services/indexation";

const { status, loadingEvents = [] } = defineProps<{
  id: string;
  status: "success" | "failure" | "idle";
  topCenter?: boolean;
  loadingEvents?: {
    eventName: LoadingEventStart;
    checkMatch: (id: number) => boolean;
  }[];
}>();

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
        indexationSocket.value![loadingEvent.eventName] = (id) => {
          if (loadingEvent.checkMatch(id)) {
            isLoading.value = true;
          }
        };

        const endEvent: `${LoadingEventStart}End` = `${loadingEvent.eventName}End`;

        indexationSocket.value![endEvent] = (id) => {
          if (loadingEvent.checkMatch(id)) {
            setTimeout(() => {
              isLoading.value = false;
            }, 1500);
          }
        };
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