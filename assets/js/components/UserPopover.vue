<template>
  <span :id="id" class="username fw-bold" style="cursor: help">{{
    stats.username
  }}</span>
  <b-popover
    :target="id"
    placement="top"
    boundary="viewport"
    triggers="hover focus"
    :delay="0"
  >
    <b-card>
      <b-card-header>
        <h4>{{ stats.username }}</h4>
        <div v-if="stats.presentationSentence">
          {{ stats.presentationSentence }}
        </div>
      </b-card-header>
      <b-card-body>
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
          {{ $tc("numéro | numéros", stats.numberOfIssues) }}<br />
          {{ stats.numberOfPublications }}
          {{ $tc("magazine | magazines", stats.numberOfPublications) }}<br />
          {{ stats.numberOfCountries }}
          {{ $tc("pays | pays", stats.numberOfCountries) }}
        </div>
        <div v-if="stats.shared === '1'" class="bookcase-link">
          <b-button
            size="xs"
            variant="secondary"
            target="_blank"
            :href="r(`/bookcase/show/{username:${stats.username}}`)"
          >
            <img
              style="height: 16px"
              :src="`${imagePath}/icons/bookcase.png`"
            />&nbsp;
            {{ $t("Voir la bibliothèque") }}
          </b-button>
        </div>
      </b-card-body>
    </b-card>
  </b-popover>
</template>

<script setup>
import {
  BButton,
  BCard,
  BCardBody,
  BCardHeader,
  BPopover,
} from "bootstrap-vue-3";

import { imagePath } from "../composables/imagePath";
import { l10n } from "../stores/l10n";
import Medal from "./Medal";

defineProps({
  id: { type: String, required: true },
  points: { type: Object, required: true },
  stats: { type: Object, required: true },
});
const { r } = l10n();
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
