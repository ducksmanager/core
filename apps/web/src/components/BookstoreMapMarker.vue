<template>
  <MapboxMarker
    ref="markerRef"
    :lng-lat="lngLat"
    :anchor="anchor"
    :color="color"
    :offset="offset"
    :popup="{ anchor: popupAnchor }"
  >
    <!-- @vue-ignore MapboxMarker declares an empty slot props type; #popup is valid per library docs -->
    <template #popup>
      <slot name="popup" />
    </template>
  </MapboxMarker>
</template>

<script setup lang="ts">
import { MapboxMarker } from "@studiometa/vue-mapbox-gl";
import type { Marker, Popup } from "mapbox-gl";
import { onBeforeUnmount, ref, unref, watch } from "vue";

const {
  anchor = "center",
  color = null,
  offset = undefined,
  popupAnchor = "top",
} = defineProps<{
  lngLat: [number, number];
  anchor?: string;
  color?: string | null;
  offset?: [number, number];
  popupAnchor?: string;
}>();

const open = defineModel<boolean>("open", { default: false });

const markerRef = ref<InstanceType<typeof MapboxMarker>>();

const syncPopupOpen = () => {
  const m = markerRef.value as
    (InstanceType<typeof MapboxMarker> & { marker: Marker }) | null;
  const marker = m?.marker;
  if (!marker) return;
  const popup = marker.getPopup();
  if (!popup) return;
  if (open.value !== popup.isOpen()) {
    marker.togglePopup();
  }
};

const bindPopupListeners = (popup: Popup | null | undefined) => {
  if (!popup || typeof popup.on !== "function") {
    return;
  }
  const handleOpen = () => {
    open.value = true;
  };
  const handleClose = () => {
    open.value = false;
  };
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
    if (popup) {
      syncPopupOpen();
    }
  },
  { flush: "post" },
);

watch(open, syncPopupOpen, { flush: "post" });

onBeforeUnmount(() => {
  detachPopupListeners?.();
});
</script>
