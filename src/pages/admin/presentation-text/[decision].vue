<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";

let router = useRouter();

onMounted(async () => {
  let currentRoute = router.currentRoute.value;
  await POST__presentation_text__$decision(axios, {
    urlParams: { decision: currentRoute.params.decision as string },
    params: currentRoute.query as unknown as {
      sentence: string;
      userId: number;
    },
  });
});
</script>
