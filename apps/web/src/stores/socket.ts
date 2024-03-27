import useDmSocket from "../composables/useDmSocket";

export const socket = defineStore("socket", () => {
  const dmSocket = ref<ReturnType<typeof useDmSocket>>();
  return {
    dmSocket,
    init: (options: Parameters<typeof useDmSocket>["0"]) => {
      dmSocket.value = useDmSocket(options);
    },
  };
});
