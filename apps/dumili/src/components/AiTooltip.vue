<template>
  <span
    v-if="show || isLoading"
    @mouseout="() => (showRepeat = false)"
    @mouseover="() => (showRepeat = true)"
  >
    <!-- <Teleport to="body">
      <b-tooltip :target="id" click @show="emit('click')" @hide="emit('blur')"
        ><slot
      /></b-tooltip>
    </Teleport> -->
    <AiSuggestionIcon
      :id="disabled ? `${id}-disabled` : id"
      button
      :is-loading="isLoading"
      :status="status" />
    <i-bi-arrow-repeat
      v-show="!isLoading && showRepeat"
      class="ms-2"
      @click="onClickRerun"
  /></span>
</template>
<script setup lang="ts" generic="LoadingEventStart extends keyof ServerSentEvents, LoadingEventEnd extends keyof ServerSentEvents">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import type { ServerSentEvents } from "~dumili-services/indexation/types";

const {
  status,
  show = true,
  loadingEvent,
  onClickRerun,
} = defineProps<{
  id: string;
  status: "success" | "failure" | "idle";
  show?: boolean;
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
const showRepeat = ref(false);

if (loadingEvent) {
  indexationSocket.value?.on(loadingEvent.startEventName, (entryId) => {
    if (loadingEvent.checkMatch(entryId)) {
      isLoading.value = true;
    }
  });

  indexationSocket.value?.on(loadingEvent.endEventName, (entryId) => {
    if (loadingEvent.checkMatch(entryId)) {
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