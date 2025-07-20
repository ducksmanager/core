<route lang="yaml">
meta:
  layout: bare
</route>
<script setup lang="ts">
import type { Decision } from "~dm-services/presentation-text";

const { presentationText: presentationTextEvents } =
  inject(socketInjectionKey)!;

(async () => {
  let currentRoute = useRoute<"/admin/presentation-text/[decision]">();
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
