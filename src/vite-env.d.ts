/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WVS_API_SECRET?: string;
  readonly VITE_NANO_BANANA_API_URL?: string;
  readonly VITE_NANO_BANANA_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
