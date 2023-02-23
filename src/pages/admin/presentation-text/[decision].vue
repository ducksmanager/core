<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";

import { call } from "~/util/axios";
import { POST__presentation_text__$decision } from "~types/routes";

let router = useRouter();

onMounted(async () => {
  let currentRoute = router.currentRoute.value;
  await call<POST__presentation_text__$decision>(axios, {
    params: { decision: currentRoute.params.decision as string },
    query: currentRoute.query as unknown as {
      sentence: string;
      userId: number;
    },
  });
});
</script>
