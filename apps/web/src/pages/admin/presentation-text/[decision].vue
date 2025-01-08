<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import type { Decision } from "~dm-services/presentation-text";

let router = useRouter();

const {
  presentationText: { events: presentationTextEvents },
} = inject(socketInjectionKey)!;

(async () => {
  let currentRoute = router.currentRoute.value;
  const { sentence, userId } = currentRoute.query as unknown as {
    sentence: string;
    userId: string;
  };
  await presentationTextEvents.approveOrDenyPresentationText(
    sentence,
    parseInt(userId),
    currentRoute.params.decision as Decision,
  );
})();
</script>
