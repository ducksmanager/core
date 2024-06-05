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
        ><template v-else>{{ $t("Vous possédez") }}</template
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
        {{ $t("publications différentes issues de") }}
        <b>{{ Object.keys(totalPerCountry).length }}</b>
        {{ t("pays | pays", Object.keys(totalPerCountry).length) }}.
      </div>
      <slot name="non-empty-collection" />
    </div>
    <slot v-else name="empty-collection"
  /></template>
</template>

<script setup lang="ts">
const { isPublic } = defineProps<{
  isPublic?: boolean;
}>();

const route = useRoute();

const username = $computed(() => route.params.username as string);

const { total, totalUniqueIssues, totalPerCountry, totalPerPublication } =
  storeToRefs(isPublic ? publicCollection() : collection());

const { t } = useI18n();
</script>
