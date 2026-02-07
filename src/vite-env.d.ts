/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENTFUL_SPACE_ID: string
  readonly VITE_CONTENTFUL_ACCESS_TOKEN: string
  readonly VITE_CONTENTFUL_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
