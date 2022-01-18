<template>
  <span>
    <span
      :id="elementId"
      class="username font-weight-bold"
    >{{ stats.username }}</span>
    <b-popover
      :target="elementId"
      placement="top"
      triggers="hover"
      :delay="0"
    >
      <template #title>
        <h4>{{ stats.username }}</h4>
        <div v-if="stats.presentationSentence">{{ stats.presentationSentence }}</div>
      </template>
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
        {{ stats.numberOfIssues }} {{ $tc('numéro | numéros', stats.numberOfIssues) }}<br>
        {{ stats.numberOfPublications }} {{ $tc('magazine | magazines', stats.numberOfPublications) }}<br>
        {{ stats.numberOfCountries }} {{ $tc('pays', stats.numberOfCountries) }}
      </div>
      <div
        v-if="bookcaseShared"
        class="bookcase-link"
      >
        <img :src="`${imagePath}/icons/bookcase.png`">&nbsp;
        <b-button
          size="xs"
          variant="outline-secondary"
          target="_blank"
          :href="$r(`/bookcase/show/{username:${stats.username}}`)"
        >
          {{ $t('Voir la bibliothèque') }}
        </b-button>
      </div>
    </b-popover>
  </span>
</template>

<script>
import Medal from "./Medal";
import {BButton, BPopover} from "bootstrap-vue-3";
import {mapActions} from "pinia";
import { l10n } from "../stores/l10n";

export default {
  name: "UserPopover",
  components: {
    Medal,
    BPopover,
    BButton
  },
  props: {
    id: {type: Number, required: true},
    points: {type: Object, required: true},
    stats: {type: Object, required: true}
  },

  setup(props) {
    return {
    ...mapActions(l10n, ["$r"]),
      elementId: `user-${props.id}-${Math.random()}`,
      bookcaseShared: true
    }
  },

}
</script>

<style scoped lang="scss">
:deep(.popover-body) {
  font-size: 1rem;
}

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
