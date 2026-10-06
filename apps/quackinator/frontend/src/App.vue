<template>
  <div class="page">
    <header class="header">
      <h1>quackinator</h1>
      <p class="tagline">
        {{
          t(
            "Which Disney comic story are you reading? Flip through it and answer — no need to know the title.",
          )
        }}
      </p>
    </header>

    <first-page-upload v-if="!started" @seed="begin" />
    <template v-else>
      <quackinator-game :key="round" :seed="seed" :restartable="false" />
      <button type="button" class="another" @click="started = false">
        {{ t("Identify another story") }}
      </button>
    </template>

    <i18n-t
      keypath="Data from {source}."
      tag="footer"
      class="footer"
      scope="parent"
    >
      <template #source>
        <a href="https://inducks.org" target="_blank" rel="noopener noreferrer"
          >Inducks</a
        >
      </template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
/**
 * The standalone site: the game, plus the page around it.
 *
 * Everything that is the *game* lives in `QuackinatorGame`, so that a host
 * embedding it — Dumili mounts it in a modal on the entry it is indexing —
 * gets the same component this page does rather than a second copy of it.
 */
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
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
  display: grid;
  gap: 1.5rem;
}

.header h1 {
  margin: 0;
  font-size: 1.9rem;
  letter-spacing: -0.02em;
}

.tagline {
  margin: 0.35rem 0 0;
  color: var(--muted);
  max-width: 42rem;
}

.another {
  justify-self: start;
}

.footer {
  color: var(--muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  margin: 0;
}

.footer a {
  color: inherit;
}
</style>
