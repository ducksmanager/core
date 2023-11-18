<template>
  <template
    v-if="
      total !== undefined &&
      totalPerPublication !== undefined &&
      totalPerCountry !== undefined
    "
  >
    <div v-if="total > 0 && totalPerPublication" id="short-stats">
      <div>
        <template v-if="isPublic">{{
          $t("{username} possède", { username })
        }}</template
        ><template v-else>>{{ $t("Vous possédez") }}</template
        >&nbsp;<b>{{ total }}</b> {{ t("numéro | numéros", total) }},
        {{ $t("dont") }}
        {{ totalUniqueIssues }}
        {{ t("numéro unique | numéros uniques", totalUniqueIssues) }}.
      </div>
      <div>
        <template v-if="isPublic">{{
          $t("La collection de {username} est composée de", { username })
        }}</template
        ><template v-else>{{ $t("Votre collection est composée de") }}</template
        >&nbsp;<b>{{ Object.keys(totalPerPublication).length }}</b>
        {{ $t("magazines différents issus de") }}
        <b>{{ Object.keys(totalPerCountry).length }}</b>
        {{ t("pays | pays", Object.keys(totalPerCountry).length) }}.
      </div>
      <slot name="non-empty-collection" />
    </div>
    <slot v-else name="empty-collection"
  /></template>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { isPublic } = defineProps<{
  isPublic?: boolean;
}>();

import { collection } from "~/stores/collection";
import { publicCollection } from "~/stores/public-collection";

const route = useRoute();

const username = $computed(() => route.params.username as string);

const store = $computed(() => (isPublic ? publicCollection() : collection()));
const total = $computed(() => store.total);
const totalUniqueIssues = $computed(() => store.totalUniqueIssues);
const totalPerCountry = $computed(() => store.totalPerCountry);
const totalPerPublication = $computed(() => store.totalPerPublication);

const { t } = useI18n();
</script>
