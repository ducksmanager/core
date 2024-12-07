<template>
  <span
    v-if="actualShow"
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
      :status="actualStatus" />
    <i-bi-arrow-repeat
      v-show="actualStatus !== 'loading' && showRepeat"
      class="ms-2"
      @click="rerun"
  /></span>
</template>
<script setup lang="ts">
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

const {
  status,
  show = true,
  rerunOnEventNamePart,
  onClickRerun,
} = defineProps<{
  id: string;
  status: "success" | "failure" | "idle" | "loading";
  show?: boolean;
  rerunOnEventNamePart?: string;
  onClickRerun: () => Promise<void>;
}>();

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

defineSlots();

// const emit = defineEmits<{
//   (e: "click"): void;
//   (e: "blur"): void;
// }>();

const actualStatus = ref(status);
const actualShow = computed(() =>
  actualStatus.value === "loading" ? true : show,
);

const disabled = ref(false); // TODO handle failed suggestions

const showRepeat = ref(false);

const rerun = () => {
  actualStatus.value = "loading";
  onClickRerun().then(() => (actualStatus.value = status));
};

defineExpose({
  rerun,
});

if (rerunOnEventNamePart) {
  watch(
    () =>
      indexationSocket.value?.ongoingCalls.some(
        (call) => call.indexOf(rerunOnEventNamePart) === 0,
      ),
    (hasOngoingCall) => {
      if (hasOngoingCall) {
        actualStatus.value = "loading";
      } else {
        setTimeout(() => {
          actualStatus.value = status;
        }, 1000);
      }
    },
  );
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