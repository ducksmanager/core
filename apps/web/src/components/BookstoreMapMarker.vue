<template>
  <MapboxMarker
    ref="markerRef"
    :lng-lat="lngLat"
    :anchor="anchor"
    :color="color"
    :offset="offset"
    :popup="popupOptions"
  >
    <!-- @vue-ignore MapboxMarker declares an empty slot props type; #popup is valid per library docs -->
    <template #popup>
      <slot name="popup" />
    </template>
  </MapboxMarker>
</template>

<script setup lang="ts">
import { MapboxMarker } from "@studiometa/vue-mapbox-gl";
import type { Popup } from "mapbox-gl";
import { computed, onBeforeUnmount, ref, unref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    lngLat: [number, number];
    anchor?: string;
    color?: string | null;
    offset?: [number, number];
    popupAnchor?: string;
  }>(),
  {
    anchor: "center",
    color: null,
    offset: undefined,
    popupAnchor: "top",
  },
);

const emit = defineEmits<{
  popupOpen: [];
  popupClose: [];
}>();

const popupOptions = computed(() => ({ anchor: props.popupAnchor }));

const markerRef = ref<InstanceType<typeof MapboxMarker> | null>(null);

const bindPopupListeners = (popup: Popup | null | undefined) => {
  if (!popup || typeof popup.on !== "function") {
    return;
  }
  const handleOpen = () => emit("popupOpen");
  const handleClose = () => emit("popupClose");
  popup.on("open", handleOpen);
  popup.on("close", handleClose);
  return () => {
    popup.off("open", handleOpen);
    popup.off("close", handleClose);
  };
};

let detachPopupListeners: (() => void) | undefined;

watch(
  () => {
    const m = markerRef.value as
      | (InstanceType<typeof MapboxMarker> & {
          popup: import("vue").ComputedRef<Popup | undefined>;
        })
      | null;
    return m?.popup ? unref(m.popup) : null;
  },
  (popup) => {
    detachPopupListeners?.();
    detachPopupListeners = bindPopupListeners(popup);
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  detachPopupListeners?.();
});
</script>
