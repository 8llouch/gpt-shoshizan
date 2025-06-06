export interface Message {
  id: string;
  content: string;
  timestamp: number;
  modelName?: string;
  imageUrl?: string;
  role?: "system" | "user" | "assistant";
}

export interface Conversation {
  id: string;
  messages: Message[];
  responses: Message[];
  systemPrompt?: string;
}

export interface ModelOptions {
  num_ctx?: number;
  repeat_last_n?: number;
  repeat_penalty?: number;
  temperature?: number;
  seed?: number;
  stop?: string;
  num_predict: number;
  top_k?: number;
  top_p?: number;
  min_p?: number;
  tfs_z?: number;
  typical_p?: number;
  mirostat?: number;
  mirostat_eta?: number;
  mirostat_tau?: number;
  num_gpu?: number;
  num_thread?: number;
}

export interface LlmRequestMessage {
  conversationId: string;
  model: string;
  prompt: string;
  stream: boolean;
  images: string[];
  system: string;
  options: ModelOptions;
  timestamp: string;
}

export interface ApiRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  images?: string[];
  system?: string;
  template?: string;
  context?: number[];
  options?: ModelOptions;
  headers?: Record<string, string>;
  conversationId: string;
}

export interface ApiResponse {
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  eval_count?: number;
}

export interface ErrorCallback {
  (error: Error): void;
}

export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId?: string;
}
