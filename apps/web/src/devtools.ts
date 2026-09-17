import setupPiniaColadaDevtools from "@pinia/colada-devtools/client-script";
import { addCustomTab } from "@vue/devtools-kit";

// Pinia Colada's devtools ship as a DevFrame rather than a Vue DevTools plugin:
// an in-page agent talking to a UI that vite.config.ts mounts at
// `<hub base><devframe id>/`. Embedding that URL puts them in Vue DevTools
// instead of a second, separate floating UI.
setupPiniaColadaDevtools();

// The agent talks to the frame over an in-page channel, so the frame only
// connects while it is a descendant of this page: use the in-app Vue DevTools
// overlay (Option+Shift+D), not the browser extension, whose panel lives on its
// own origin. Absolute so it at least resolves there rather than 404ing.
const frameUrl = new URL("/__devframes/pinia-colada/", location.origin).href;

addCustomTab({
  name: "pinia-colada",
  title: "Pinia Colada",
  icon: "i-carbon-data-base",
  category: "modules",
  view: {
    type: "iframe",
    src: frameUrl,
  },
});
