import { SocketClient } from "socket-call-client";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  return {
    provide: {
      dmSocket: new SocketClient(config.public.dmSocketUrl),
    },
  };
});
