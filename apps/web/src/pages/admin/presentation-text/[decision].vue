<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import { POST__presentation_text__$decision } from "~api-routes";
import axios from "axios";

import { call } from "~/util/axios";

let router = useRouter();

(async () => {
  let currentRoute = router.currentRoute.value;
  await call(
    axios,
    new POST__presentation_text__$decision({
      params: { decision: currentRoute.params.decision as string },
      reqBody: currentRoute.query as unknown as {
        sentence: string;
        userId: number;
      },
    })
  );
})();
</script>
