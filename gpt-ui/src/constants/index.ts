export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  LLM_API_URL: import.meta.env.VITE_LLM_API_URL || 'http://localhost:3000/gateway/ollama/generate',
  KAFKA_PRODUCER_URL_INPUTS:
    import.meta.env.VITE_KAFKA_PRODUCER_URL_INPUTS ||
    'http://localhost:3000/gateway/producer/message-producer/ai-inputs',
  KAFKA_PRODUCER_URL_OUTPUTS:
    import.meta.env.VITE_KAFKA_PRODUCER_URL_OUTPUTS ||
    'http://localhost:3000/gateway/producer/message-producer/ai-outputs',
  AUTH_BASE_URL: import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3000',
  CONVERSATIONS_API_URL:
    import.meta.env.VITE_CONVERSATIONS_API_URL || 'http://localhost:3000/gateway/api/conversations',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_CONVERSATION_TITLE_LENGTH: 40,
  MESSAGE_BATCH_SIZE: 50,
  AUTO_SCROLL_THRESHOLD: 100,
  TYPING_INDICATOR_DELAY: 500,
} as const
