/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_LLM_API_URL: string
  readonly VITE_KAFKA_PRODUCER_URL_INPUTS: string
  readonly VITE_KAFKA_PRODUCER_URL_OUTPUTS: string
  readonly VITE_AUTH_BASE_URL: string
  readonly VITE_CONVERSATIONS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
