<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import type { Decision } from "~dm-services/presentation-text/types";

let router = useRouter();

const {
  presentationText: { services: presentationTextServices },
} = inject(socketInjectionKey)!;

(async () => {
  let currentRoute = router.currentRoute.value;
  const { sentence, userId } = currentRoute.query as unknown as {
    sentence: string;
    userId: string;
  };
  await presentationTextServices.approveOrDenyPresentationText(
    sentence,
    parseInt(userId),
    currentRoute.params.decision as Decision,
  );
})();
</script>
