<template>
  <Popper placement="auto" arrow hover teleport="body" :show="show">
    <span class="username fw-bold" @mouseleave="forceClosePopup">{{
      stats.username
    }}</span>
    <template #content>
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
            {{ $t("numéro | numéros", stats.numberOfIssues) }}<br />
            {{ stats.numberOfPublications }}
            {{ $t("magazine | magazines", stats.numberOfPublications) }}<br />
            {{ stats.numberOfCountries }}
            {{ $t("pays | pays", stats.numberOfCountries) }}
          </div>
          <div v-if="bookcaseShared" class="bookcase-link">
            <img :src="`${imagePath}/icons/bookcase.png`" />&nbsp;
            <b-button
              size="xs"
              variant="outline-secondary"
              target="_blank"
              :href="r(`/bookcase/show/{username:${stats.username}}`)"
            >
              {{ $t("Voir la bibliothèque") }}
            </b-button>
          </div>
        </b-card-body>
      </b-card>
    </template>
  </Popper>
</template>

<script setup>
import Popper from "@bperel/vue3-popper-teleport";
import { BButton, BCard, BCardBody, BCardHeader } from "bootstrap-vue-3";

import { l10n } from "../stores/l10n";
import Medal from "./Medal";

defineProps({
  id: { type: Number, required: true },
  points: { type: Object, required: true },
  stats: { type: Object, required: true },
});
const { r } = l10n();
const bookcaseShared = true;
const closeDelay = 500;
const forceClosePopup = () => {
  setTimeout(() => (show = false), closeDelay);
  setTimeout(() => (show = null), closeDelay * 2);
};
let show = $ref(null);
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
