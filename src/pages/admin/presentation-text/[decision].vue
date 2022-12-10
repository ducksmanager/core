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
  await axios.post(
    "/presentation-text/" + currentRoute.params.decision,
    currentRoute.query
  );
});
</script>
