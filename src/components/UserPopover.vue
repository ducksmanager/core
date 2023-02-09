<template>
  <Popover>
    <span class="username fw-bold">{{ stats.username }}</span>
    <template #header>
      <h4>{{ stats.username }}</h4>
      <div v-if="stats.presentationText">
        {{ stats.presentationText }}
      </div>
    </template>
    <template #content>
      <div class="p-2">
        <div class="d-flex">
          <Medal
            v-for="(numberOfPoints, contribution) in points"
            :key="contribution"
            :contribution="(contribution as string)"
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
        <div v-if="stats.allowSharing" class="bookcase-link">
          <router-link
            v-slot="{ href, navigate }"
            :to="`/bookcase/show/${stats.username}`"
            custom
          >
            <b-button
              size="sm"
              variant="outline-secondary"
              target="_blank"
              :href="href"
              @click="navigate"
            >
              <img :src="getImagePath('icons/bookcase.png')" />&nbsp;
              {{ $t("Voir la bibliothèque") }}
            </b-button>
          </router-link>
        </div>
        <b-alert
          :model-value="showOkForExchanges"
          :variant="stats.okForExchanges ? 'info' : 'warning'"
          class="mt-4"
        >
          <span v-if="stats.okForExchanges">{{
            $t("Peut vendre ou échanger des numéros")
          }}</span
          ><span v-else>{{
            $t("Accepte seulement de vendre des numéros")
          }}</span>
        </b-alert>
      </div>
    </template>
  </Popover>
</template>

<script setup lang="ts">
import { BAlert, BButton } from "bootstrap-vue-next";
import { useI18n } from "vue-i18n";

import { images } from "~/stores/images";
import { SimpleUserWithQuickStats } from "~types/SimpleUserWithQuickStats";

defineProps<{
  points: { [contribution: string]: number };
  stats: SimpleUserWithQuickStats;
  showOkForExchanges?: boolean;
}>();
const { t: $t } = useI18n();
const getImagePath = images().getImagePath;
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
    height: 16px;
  }

  a {
    border-width: 1px;
  }
}
</style>
