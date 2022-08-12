<template>
  <Popover>
    <span class="username fw-bold">{{ stats.username }}</span>
    <template #header>
      <h4>{{ stats.username }}</h4>
      <div v-if="stats.presentationSentence">
        {{ stats.presentationSentence }}
      </div>
    </template>
    <template #content>
      <div class="p-2">
        <div class="d-flex">
          <Medal
            v-for="(numberOfPoints, contribution) in points"
            :key="contribution"
            :contribution="contribution"
            :user-level-points="numberOfPoints"
            small
          />
        </div>
        <div class="clearfix" />
        <div>
          {{ stats.numberOfIssues }}
          {{ $tc("numéro | numéros", stats.numberOfIssues) }}<br>
          {{ stats.numberOfPublications }}
          {{ $tc("magazine | magazines", stats.numberOfPublications) }}<br>
          {{ stats.numberOfCountries }}
          {{ $tc("pays | pays", stats.numberOfCountries) }}
        </div>
        <div v-if="stats.shared === '1'" class="bookcase-link">
          <BButton
            size="xs"
            variant="outline-secondary"
            target="_blank"
            :href="r(`/bookcase/show/{username:${stats.username}}`)"
          >
            <img
              style="height: 16px"
              src="/images/icons/bookcase.png"
            >&nbsp;
            {{ $t("Voir la bibliothèque") }}
          </BButton>
        </div>
      </div>
    </template>
  </Popover>
</template>

<script setup>
import { BButton } from 'bootstrap-vue-3'

import { l10n } from '~/stores/l10n'

defineProps({
  points: { type: Object, required: true },
  stats: { type: Object, required: true },
})
const { r } = l10n()
</script>

<style scoped lang="scss">
.username {
  cursor: help;
}
.bookcase-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  white-space: nowrap;

  img {
    height: 32px;
  }

  a:hover {
    border: none;
  }
}
</style>
