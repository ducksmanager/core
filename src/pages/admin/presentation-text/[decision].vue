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
  await routes["POST /presentation-text/:decision"](
    axios,
    {},
    {
      params: currentRoute.query,
      urlParams: { decision: currentRoute.params.decision as string },
    }
  );
});
</script>
