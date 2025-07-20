import { computed } from "vue";
import { useRoute } from "vue-router";

export const useLayout = () => {
  const route = useRoute();

  const currentLayout = computed(() => route.meta?.layout || "default");

  return {
    currentLayout,
  };
};
