<template>
  <Popper
    placement="top"
    arrow
    manual
    teleport="body"
    :show="isOverPopup || isOverPopupText"
  >
    <span
      class="username fw-bold"
      @mouseenter="isOverPopupText = true"
      @mouseleave="closePopupSoon"
      >{{ stats.username }}</span
    >
    <template #content>
      <b-card
        body-class="p-0"
        @mouseenter="isOverPopup = true"
        @mouseleave="isOverPopup = false"
      >
        <b-card-header>
          <h4>{{ stats.username }}</h4>
          <div v-if="stats.presentationSentence">
            {{ stats.presentationSentence }}
          </div>
        </b-card-header>
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
            {{ $tc("numéro | numéros", stats.numberOfIssues) }}<br />
            {{ stats.numberOfPublications }}
            {{ $tc("magazine | magazines", stats.numberOfPublications) }}<br />
            {{ stats.numberOfCountries }}
            {{ $tc("pays | pays", stats.numberOfCountries) }}
          </div>
          <div v-if="stats.shared === '1'" class="bookcase-link">
            <b-button
              size="xs"
              variant="outline-secondary"
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
        </div>
      </b-card>
    </template>
  </Popper>
</template>

<script setup>
import Popper from "@bperel/vue3-popper-teleport";
import { BButton, BCard, BCardHeader } from "bootstrap-vue-3";

import { imagePath } from "../composables/imagePath";
import { l10n } from "../stores/l10n";
import Medal from "./Medal";

defineProps({
  id: { type: String, required: true },
  points: { type: Object, required: true },
  stats: { type: Object, required: true },
});
const { r } = l10n(),
  closeDelay = 500,
  closePopupSoon = () => {
    setTimeout(() => {
      isOverPopupText = false;
    }, closeDelay);
  };
let isOverPopup = $ref(false),
  isOverPopupText = $ref(false);
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
