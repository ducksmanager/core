<template>
  <span
    @mouseout="() => (isInteractive = false)"
    @mouseover="() => (isInteractive = true)"
  >
    <Teleport to="body">
      <b-tooltip :target="id"
        ><i-bi-arrow-repeat
          class="position-absolute start-0 ms-2 cursor-pointer"
          @click="onClickRerun" /><slot
      /></b-tooltip>
    </Teleport>
    <AiSuggestionIcon
      :id="disabled ? `${id}-disabled` : id"
      button
      :is-loading="isLoading"
      :status="status"
    />
  </span>
</template>
<script setup lang="ts" generic="LoadingEventStart extends keyof ServerSentEvents, LoadingEventEnd extends keyof ServerSentEvents">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { ServerSentEvents } from "~dumili-services/indexation/types";

const { status, loadingEvent, onClickRerun } = defineProps<{
  id: string;
  status: "success" | "failure" | "idle";
  loadingEvent?: {
    startEventName: LoadingEventStart;
    endEventName: LoadingEventEnd;
    checkMatch: (
      id: Parameters<ServerSentEvents[LoadingEventStart]>[0],
    ) => boolean;
  };
  onClickRerun: () => Promise<void>;
}>();

defineSlots();

defineEmits<{
  (e: "click"): void;
  (e: "blur"): void;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const isLoading = ref(false);
const disabled = ref(false); // TODO handle failed suggestions
const isInteractive = ref(false);

if (loadingEvent) {
  indexationSocket.value?.on(loadingEvent.startEventName, (entryId) => {
    if (loadingEvent.checkMatch(entryId)) {
      isLoading.value = true;
    }
  });

  indexationSocket.value?.on(loadingEvent.endEventName, (entryId) => {
    if (loadingEvent.checkMatch(entryId)) {
      console.log("match end");
      setTimeout(() => {
        isLoading.value = false;
      }, 1500);
    }
  });
}
</script>

<style lang="scss" scoped>
span > svg {
  width: 20px;
  height: 20px;
  color: black;
  cursor: pointer;
}
</style>