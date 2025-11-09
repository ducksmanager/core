import type { Preview } from "@storybook/vue3-vite";
import { setup } from "@storybook/vue3-vite";
import { getCurrentInstance, ref } from "vue";
import { createPinia } from "pinia";
import { createBootstrap } from "bootstrap-vue-next";
import { createRouter, createWebHistory } from "vue-router";
import { createHead } from "@unhead/vue";
import VueDraggableResizable from "vue-draggable-resizable";
import i18n from "../src/i18n";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import "../src/style.scss";
import { SocketClient, buildWebStorage } from "./mocks/socket";
import useDumiliSocket, {
  dumiliSocketInjectionKey,
} from "../src/composables/useDumiliSocket";
import useDmSocket, {
  socketInjectionKey as dmSocketInjectionKey,
} from "~web/src/composables/useDmSocket";
import type { AxiosStorage } from "socket-call-client";
import { defineStore } from "pinia";
import { images } from "~web/src/stores/images";

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: { template: "<div>Home</div>" },
    },
  ],
});

setup((app) => {
  const pinia = createPinia();
  const head = createHead();

  // Configure app for DevTools compatibility
  // This helps Vue DevTools extension track the app instance properly
  // Ensure the app instance is properly exposed to DevTools
  if (typeof window !== "undefined") {
    const devtoolsHook = (window as unknown as Record<string, unknown>)
      .__VUE_DEVTOOLS_GLOBAL_HOOK__;
    if (
      devtoolsHook &&
      typeof devtoolsHook === "object" &&
      "emit" in devtoolsHook
    ) {
      (devtoolsHook as { emit: (event: string, app: unknown) => void }).emit(
        "app:init",
        app,
      );
    }
  }

  app.use(createBootstrap());
  app.use(i18n);
  app.use(pinia);

  images();

  const coaStore = defineStore("coa", () => ({
    storyDetails: ref({
      "I TL  116-AP": {
        title: "A Sample Story",
        storycode: "I TL  116-AP",
      },
      "I TL 5678-B": {
        title: "Another Story",
        storycode: "I TL 5678-B",
      },
    } as const),
    storyUrls: ref({
      "I TL  116-AP": "webusers/webusers/2005/12/us_mad_006b_001.jpg",
      "I TL 5678-B": "mock-url-2",
    } as const),
    publicationNames: ref({
      "us/DD": "Donald Duck",
      "fr/PM": "Picsou Magazine",
      "dk/AND": "Anders And & Co.",
    } as const),
  }));
  coaStore(pinia);

  // Mock ui store
  const uiStore = defineStore("ui", () => ({
    currentPage: ref(0),
    visiblePages: ref(new Set<number>()),
    pageHeight: ref(50),
    currentEntry: ref(null),
    overlay: ref(null),
  }));
  uiStore(pinia);

  // Setup router
  app.use(router);

  // Setup head
  app.use(head);

  // Register vue-draggable-resizable component
  app.component("VueDraggableResizable", VueDraggableResizable);

  // Provide mocked sockets - these will be injected by composables
  const dmSocket = new SocketClient();
  const dumiliSocket = new SocketClient();
  const storySearchSocket = new SocketClient();

  app.provide("dmSocket", dmSocket);
  app.provide("dumiliSocket", dumiliSocket);
  app.provide("storySearchSocket", storySearchSocket);
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (story) => {
      const StoryComponent = story();
      return {
        components: { StoryComponent },
        setup() {
          // This runs in component context, so inject() will work
          const mockSession = {
            getToken: () => Promise.resolve("mock-token"),
            clearSession: () => {},
            sessionExists: () => Promise.resolve(true),
          };

          const onConnectError = () => {};

          // Setup composables in component context
          const dumiliSocketInstance = useDumiliSocket({
            session: mockSession,
            onConnectError,
          });

          const dmSocketInstance = useDmSocket({
            cacheStorage: buildWebStorage(
              sessionStorage,
            ) as unknown as AxiosStorage,
            session: mockSession,
            onConnectError,
          });

          getCurrentInstance()!.appContext.app.provide(
            dumiliSocketInjectionKey,
            dumiliSocketInstance,
          );
          getCurrentInstance()!.appContext.app.provide(
            dmSocketInjectionKey,
            dmSocketInstance,
          );
        },
        template: "<StoryComponent />",
      };
    },
  ],
};

export default preview;
