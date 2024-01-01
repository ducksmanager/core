<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import {
  Decision,
  NamespaceEndpoint as PresentationTextNamespaceEndpoint,
  Services as PresentationTextServices,
} from "~services/presentation-text/types";

const services = useSocket<PresentationTextServices>(
  PresentationTextNamespaceEndpoint,
);

let router = useRouter();

(async () => {
  let currentRoute = router.currentRoute.value;
  const { sentence, userId } = currentRoute.query as unknown as {
    sentence: string;
    userId: string;
  };
  await services(
    "approveOrDenyPresentationText",
    sentence,
    parseInt(userId),
    currentRoute.params.decision as Decision,
  );
})();
</script>
