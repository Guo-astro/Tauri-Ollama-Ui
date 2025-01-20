// src/store/conversationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ConversationMeta,
  ConversationMessage,
  IModelType,
} from "@/core/types";

interface ConversationsState {
  availableModels: IModelType[]; // Define type accordingly
  conversations: ConversationMeta[];
  focusedConvId: string | null;
  focusedConvMeta: ConversationMeta | null;
  focusedConvData: ConversationMessage[];
  lastUsedModel: string;
}

const initialState: ConversationsState = {
  availableModels: [], // Initialize as empty array
  conversations: [],
  focusedConvId: null,
  focusedConvMeta: null,
  focusedConvData: [],
  lastUsedModel: "",
};

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<ConversationMeta[]>) {
      state.conversations = action.payload;
    },
    addConversation(state, action: PayloadAction<ConversationMeta>) {
      state.conversations.push(action.payload);
    },
    setFocusedConvId(state, action: PayloadAction<string>) {
      state.focusedConvId = action.payload;
    },
    setFocusedConvMeta(state, action: PayloadAction<ConversationMeta>) {
      state.focusedConvMeta = action.payload;
    },
    setFocusedConvData(state, action: PayloadAction<ConversationMessage[]>) {
      state.focusedConvData = action.payload;
    },
    setLastUsedModel(state, action: PayloadAction<string>) {
      state.lastUsedModel = action.payload;
    },
    setAvailableModels(state, action: PayloadAction<IModelType[]>) {
      state.availableModels = action.payload;
    },
    // Add other reducers as needed
  },
});

export const {
  setConversations,
  addConversation,
  setFocusedConvId,
  setFocusedConvMeta,
  setFocusedConvData,
  setLastUsedModel,
  setAvailableModels,
} = conversationsSlice.actions;

export const conversationsReducer = conversationsSlice.reducer;
