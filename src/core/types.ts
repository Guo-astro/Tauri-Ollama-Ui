// src/core/types.ts

/**
 * Represents one conversation’s basic info.
 * `created_at` is stored as an ISO date string.
 */
export interface ConversationMeta {
  id: string;
  created_at: string;
  model: string;
  title: string;
  is_new?: boolean;
}

/** Array of conversation metadata objects. */
export type IConversations = ConversationMeta[];

/**
 * Represents one message (user or AI) in a conversation.
 * `created_at` is stored as an ISO date string.
 * `ctx` is optional and, if present, contains a JSON string.
 */
export type ConversationMessage = {
  id: string;
  conversation_id: string;
  created_at: string;
  ai_replied: boolean;
  message: string;
  ctx?: string;
};

/** Array of conversation messages. */
export type ConversationMessages = ConversationMessage[];

/**
 * Represents a single model installed by Ollama.
 */
export type IModelType = {
  name: string;
  digest: string;
  modified_at: string;
  size: number;
};

/**
 * The shape of your global `core` state for "simple-core-state"
 * or anywhere else you store global app data.
 */
export type ICoreType = {
  database: {
    ready: boolean;
  };
  conversations: IConversations;
  focused_conv_id: string;
  focused_conv_data: ConversationMessages;
  focused_conv_meta: ConversationMeta;
  last_used_model: string;

  server_host: string;
  server_connected: boolean;
  available_models: IModelType[];
  introduction_finished: boolean;
};
