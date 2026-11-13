/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Removes vite's `Record<string, any>` fallback, so an undeclared
// import.meta.env key is a compile error instead of silently `any`.
interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_COOKIE_DOMAIN: string;
  readonly VITE_DM_SOCKET_URL: string;
  readonly VITE_DM_STORY_SEARCH_SOCKET_URL: string;
  readonly VITE_EDGES_ROOT: string;
  readonly VITE_IMAGES_ROOT: string;
  readonly VITE_SENTRY_RELEASE: string;
  readonly VITE_SENTRY_DSN: string | undefined;
}
