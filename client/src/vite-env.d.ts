interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_CLERK_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}