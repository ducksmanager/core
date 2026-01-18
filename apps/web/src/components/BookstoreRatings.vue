<template>
  <b-tr
    v-for="rating in (['atmosphereRating', 'pricesRating', 'selectionRating'] as const).filter(rating => ratings[rating])"
    :key="rating"
  >
    <b-td
      :class="{
        'bg-transparent text-white': !dark,
      }"
    >
      <template v-if="rating === 'atmosphereRating'">
        {{ $t(`Ambiance`) }}
      </template>
      <template v-else-if="rating === 'pricesRating'">
        {{ $t(`Prix`) }}
      </template>
      <template v-else-if="rating === 'selectionRating'">
        {{ $t(`Sélection`) }}
      </template>
    </b-td>
    <b-td :class="{ 'bg-transparent text-white': !dark }">
      <StarRating
        v-model:rating="ratings[rating]!"
        :readonly="readonly"
        :max-rating="10"
        ><template #emptyStarIcon><i-bi-star-fill /></template>
        <template #filledStarIcon><i-bi-star /></template
      ></StarRating>
    </b-td>
  </b-tr>
</template>

<script setup lang="ts">
import { bookstoreComment } from "~prisma-schemas/client_dm/client";

const ratings = defineModel<
  Pick<
    bookstoreComment,
    "atmosphereRating" | "pricesRating" | "selectionRating"
  >
>({
  required: true,
});

defineProps<{
  dark: boolean;
  readonly: boolean;
}>();
</script>