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

// Mock Cloudinary global object
if (typeof window !== "undefined") {
  (window as any).cloudinary = {
    openUploadWidget: (
      _options: unknown,
      callback: (error: unknown, result: unknown) => void,
    ) => ({
      close: () => {
        if (import.meta.env.DEV) {
          console.log("[MockCloudinary] Widget closed");
        }
      },
      _simulateUpload: (fileCount: number = 1, isPdf: boolean = false) => {
        for (let i = 0; i < fileCount; i++) {
          callback(null, {
            event: "upload-added",
            info: {
              id: `mock-file-${i + 1}`,
              secure_url: `https://via.placeholder.com/150?text=Page+${i + 1}`,
            },
          });
        }
        callback(null, {
          event: "queues-start",
        });
        setTimeout(() => {
          callback(null, {
            event: "success",
            info: {
              id: "mock-file-1",
              secure_url: "https://via.placeholder.com/150?text=Uploaded+Page",
              pages: isPdf ? fileCount : undefined,
            },
          });
        }, 100);
      },
    }),
  };
}

setup((app) => {
  const pinia = createPinia();
  const head = createHead();

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
    countryNames: ref({
      us: "United States",
      fr: "France",
      dk: "Denmark",
    } as const),
    publicationNamesFullCountries: ref(["us", "fr", "dk"]),
    issuecodesByPublicationcode: ref({
      "us/DD": ["us/DD 1", "us/DD 2", "us/DD 3"],
      "fr/PM": ["fr/PM 1", "fr/PM 2", "fr/PM 3"],
      "dk/AND": ["dk/AND 1", "dk/AND 2", "dk/AND 3"],
    }),
    issuecodeDetails: ref({
      "us/DD 1": {
        issuecode: "us/DD 1",
        publicationcode: "us/DD",
        issuenumber: "1",
      },
      "us/DD 2": {
        issuecode: "us/DD 2",
        publicationcode: "us/DD",
        issuenumber: "2",
      },
      "us/DD 3": {
        issuecode: "us/DD 3",
        publicationcode: "us/DD",
        issuenumber: "3",
      },
      "fr/PM 1": {
        issuecode: "fr/PM 1",
        publicationcode: "fr/PM",
        issuenumber: "1",
      },
      "fr/PM 2": {
        issuecode: "fr/PM 2",
        publicationcode: "fr/PM",
        issuenumber: "2",
      },
      "fr/PM 3": {
        issuecode: "fr/PM 3",
        publicationcode: "fr/PM",
        issuenumber: "3",
      },
      "dk/AND 1": {
        issuecode: "dk/AND 1",
        publicationcode: "dk/AND",
        issuenumber: "1",
      },
      "dk/AND 2": {
        issuecode: "dk/AND 2",
        publicationcode: "dk/AND",
        issuenumber: "2",
      },
      "dk/AND 3": {
        issuecode: "dk/AND 3",
        publicationcode: "dk/AND",
        issuenumber: "3",
      },
    }),
    fetchCountryNames: async () => {},
    fetchPublicationNamesFromCountry: async (_countrycode: string) => {},
    fetchIssuecodesByPublicationcode: async (_publicationcode: string) => {},
    fetchIssuecodeDetails: async (_issuecodes: string[]) => {},
  }));
  coaStore(pinia);

  const uiStore = defineStore("ui", () => ({
    currentPage: ref(0),
    visiblePages: ref(new Set<number>()),
    pageHeight: ref(50),
    currentEntry: ref(null),
    overlay: ref(null),
  }));
  uiStore(pinia);

  const collectionStore = defineStore("collection", () => ({
    user: ref({
      id: 1,
      username: "storybook-user",
      inducksUsername: "storybook-user",
    }),
    isLoadingUser: ref(false),
    loadUser: async () => {},
    loadUserPermissions: async () => {},
    login: async () => {},
  }));
  collectionStore(pinia);

  app.use(router);

  app.use(head);

  app.component("VueDraggableResizable", VueDraggableResizable);

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
  },
  decorators: [
    (story) => ({
      components: { StoryComponent: story() },
      setup() {
        const mockSession = {
          getToken: () => Promise.resolve("mock-token"),
          clearSession: () => {},
          sessionExists: () => Promise.resolve(true),
        };

        const onConnectError = () => {};

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
    }),
  ],
};

export default preview;
