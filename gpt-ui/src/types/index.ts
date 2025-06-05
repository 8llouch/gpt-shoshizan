export interface Conversation {
  id: string
  title: string
  messages: Message[]
  responses: Message[]
  systemPrompt?: string
}

export interface AppState {
  currentConversation: Conversation | null
  conversations: Conversation[]
  isLoading: boolean
  theme: Theme
  error: AppError | null
}

export type Theme = 'light' | 'dark' | 'auto'

export interface AppError {
  code: string
  message: string
  timestamp: Date
  context?: Record<string, unknown>
}

export type APIError = AppError & {
  status: number
  endpoint: string
}

export interface Message {
  id: string
  content: string
  timestamp: number
  modelName?: string
  imageUrl?: string
  role: 'system' | 'user' | 'assistant'
}

export interface ModelOptions {
  num_ctx?: number // The number of context tokens to use for the model. (Default: 2048)
  repeat_last_n?: number // The number of tokens to consider for repetition penalty. (Default: 64, 0 = disabled, -1 = num_ctx)
  repeat_penalty?: number // Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (Default: 1.1)
  temperature?: number // The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)
  seed?: number // Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (Default: 0)
  stop?: string // Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return. Multiple stop patterns may be set by specifying multiple separate stop parameters in a modelfile.
  num_predict: number // Maximum number of tokens to predict when generating text. (Default: -1, infinite generation)
  top_k?: number // Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (Default: 40)
  top_p?: number // Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)
  min_p?: number // Alternative to the top_p, and aims to ensure a balance of quality and variety. The parameter p represents the minimum probability for a token to be considered, relative to the probability of the most likely token. For example, with p=0.05 and the most likely token having a probability of 0.9, logits with a value less than 0.045 are filtered out. (Default: 0.0)
  tfs_z?: number
  typical_p?: number
  mirostat?: number
  mirostat_eta?: number
  mirostat_tau?: number
  num_gpu?: number
  num_thread?: number
}

export interface ApiRequest {
  model: string
  prompt: string
  stream?: boolean
  images?: string[]
  system?: string
  template?: string
  context?: number[]
  options?: ModelOptions
  headers?: Record<string, string>
  conversationId: string
}

export interface ApiResponse {
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_duration?: number
  eval_duration?: number
  eval_count?: number
}
