<template>
  <b-container class="page d-grid gap-4 py-5">
    <header>
      <h1 class="h2 mb-1">quackinator</h1>
      <p class="text-body-secondary mb-0">
        {{
          t(
            "Which Disney comic story are you reading? Flip through it and answer — no need to know the title.",
          )
        }}
      </p>
    </header>

    <first-page-upload v-if="!started" @seed="begin" />
    <template v-else>
      <quackinator-game :key="round" :seed="seed" />
      <b-button
        variant="secondary"
        class="justify-self-start"
        @click="started = false"
      >
        {{ t("Identify another story") }}
      </b-button>
    </template>

    <i18n-t
      keypath="Data from {source}."
      tag="footer"
      class="small text-body-secondary border-top pt-3"
      scope="parent"
    >
      <template #source>
        <a
          href="https://inducks.org"
          target="_blank"
          rel="noopener noreferrer"
          class="link-secondary"
          >Inducks</a
        >
      </template>
    </i18n-t>
  </b-container>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { I18nT } from "vue-i18n";

import FirstPageUpload from "~quackinator/components/FirstPageUpload.vue";
import QuackinatorGame from "~quackinator/components/QuackinatorGame.vue";
import { useQuackinatorI18n } from "~quackinator/i18n";
import type { Seed } from "~quackinator/types";

const { t } = useQuackinatorI18n();

const started = ref(false);
const seed = shallowRef<Seed>();
// A fresh game per story, so a new seed starts a new session.
const round = ref(0);

const begin = (found: Seed | undefined) => {
  seed.value = found;
  round.value += 1;
  started.value = true;
};
</script>

<style scoped>
.page {
  max-width: 62rem;
}

.justify-self-start {
  justify-self: start;
}
</style>
