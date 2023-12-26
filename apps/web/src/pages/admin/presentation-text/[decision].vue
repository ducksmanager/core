<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import { io, Socket } from "socket.io-client";

import {
  Decision,
  Namespace as PresentationTextNamespace,
  Services as PresentationTextServices,
} from "~api/services/presentation-text/types";

let socket: Socket<PresentationTextServices> = io(
  import.meta.env.VITE_SOCKET_URL + PresentationTextNamespace["endpoint"],
);

let router = useRouter();

(async () => {
  let currentRoute = router.currentRoute.value;
  const { sentence, userId } = currentRoute.query as unknown as {
    sentence: string;
    userId: string;
  };
  await socket.emitWithAck(
    "approveOrDenyPresentationText",
    sentence,
    parseInt(userId),
    currentRoute.params.decision as Decision,
  );
})();
</script>
