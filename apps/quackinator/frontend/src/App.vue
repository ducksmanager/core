<script setup lang="ts">
/**
 * The standalone site: the game, plus the page around it.
 *
 * Everything that is the *game* lives in `QuackinatorGame`, so that a host
 * embedding it — Dumili mounts it in a modal on the entry it is indexing —
 * gets the same component this page does rather than a second copy of it.
 */
import QuackinatorGame from "~quackinator/components/QuackinatorGame.vue";
</script>

<template>
  <div class="page">
    <header class="header">
      <h1>quackinator</h1>
      <p class="tagline">
        Which Disney comic story are you reading? Flip through it and answer —
        no need to know the title.
      </p>
    </header>

    <quackinator-game />

    <footer class="footer">
      Data from
      <a href="https://inducks.org" target="_blank" rel="noopener noreferrer"
        >Inducks</a
      >.
    </footer>
  </div>
</template>

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
