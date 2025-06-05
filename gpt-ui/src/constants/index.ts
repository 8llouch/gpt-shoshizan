export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
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

export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  STORAGE_KEY: 'app-theme',
  ANIMATION_DURATION: 200,
} as const

export const STORAGE_KEYS = {
  THEME: 'app-theme',
  USER_PREFERENCES: 'user-preferences',
  CONVERSATIONS: 'conversations',
  CURRENT_CONVERSATION: 'current-conversation',
  APP_STATE: 'app-state',
} as const

export const EVENTS = {
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_SELECTED: 'conversation:selected',
  CONVERSATION_DELETED: 'conversation:deleted',
  THEME_CHANGED: 'theme:changed',
  ERROR_OCCURRED: 'error:occurred',
} as const

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 280,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1200,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 80,
} as const

export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const

export const VALIDATION = {
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: CHAT_CONFIG.MAX_MESSAGE_LENGTH,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 100,
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 50,
} as const

export const MODELS = {
  LLAMA_3_2: 'llama3.2',
  GEMMA_3: 'gemma3:4b',
  LLAVA: 'llava',
  DEEPSEEK: 'deepseek-r1',
  CLAUDE: 'incept5/llama3.1-claude:latest',
} as const

export const MODEL_OPTIONS = [
  { text: 'llama3.2', value: 'llama3.2' },
  { text: 'gemma3', value: 'gemma3:4b' },
  { text: 'llava', value: 'llava' },
  { text: 'deepseek', value: 'deepseek-r1' },
  { text: 'claude', value: 'incept5/llama3.1-claude:latest' },
] as const

export const DEFAULTS = {
  CONVERSATION_TITLE: 'Nouvelle conversation',
  USER_NAME: 'Utilisateur',
  MODEL: 'llama3.2',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048,
  LANGUAGE: 'fr-FR',
} as const

export const FEATURES = {
  ENABLE_REGENERATE: true,
  ENABLE_EXPORT: true,
  ENABLE_SEARCH: true,
  ENABLE_VOICE_INPUT: false,
  ENABLE_FILE_UPLOAD: false,
  ENABLE_MARKDOWN_PREVIEW: true,
} as const
