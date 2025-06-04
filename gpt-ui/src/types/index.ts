export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  isTyping?: boolean
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  tokens?: number
  model?: string
  temperature?: number
  error?: string
}

export interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages?: Message[]
  settings?: ConversationSettings
}

export interface ConversationSettings {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt?: string
}

export interface User {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: Theme
  language: string
  autoScroll: boolean
  showTimestamps: boolean
}

export interface AppState {
  currentConversation: Conversation | null
  conversations: Conversation[]
  user: User | null
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

export interface ChatEvents {
  sendMessage: (message: string) => void
  regenerateResponse: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  updateSettings: (settings: Partial<ConversationSettings>) => void
}

export type MessageRole = Message['role']
export type ConversationId = string
export type MessageId = string

export interface SendMessageRequest {
  content: string
  conversationId?: string
  settings?: Partial<ConversationSettings>
}

export interface SendMessageResponse {
  message: Message
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface MessageBubbleProps {
  message: Message
  showAvatar?: boolean
  showTimestamp?: boolean
}

export interface ConversationListProps {
  conversations: Conversation[]
  currentId?: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const
export const THEMES = ['light', 'dark', 'auto'] as const

export function isValidMessageRole(role: string): role is MessageRole {
  return MESSAGE_ROLES.includes(role as MessageRole)
}

export function isValidTheme(theme: string): theme is Theme {
  return THEMES.includes(theme as Theme)
}
