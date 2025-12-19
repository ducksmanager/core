/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_CLOUDINARY_URL_ROOT: string;
  readonly VITE_DM_URL: string;
  readonly VITE_DM_SOCKET_URL: string;
  readonly VITE_FLAGS_ROOT: string;
  readonly VITE_IMAGES_ROOT: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
