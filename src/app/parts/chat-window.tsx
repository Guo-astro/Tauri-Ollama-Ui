// src/app/parts/chat-window.tsx

import { ChatHeader } from "./chat-header";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import {
  actions,
  generateIdNumber,
  generateRandomId,
  sendPrompt,
} from "@/core";
import dayjs from "dayjs";
import { ConversationMessage, ConversationMeta } from "@/core/types";
import { ChatMessage } from "./chat-message";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  addConversation,
  setFocusedConvId,
  setFocusedConvMeta,
  setFocusedConvData,
  setLastUsedModel,
} from "@/store/conversationsSlice";

export const ChatWindow = () => {
  const dispatch = useDispatch();

  const focusedConvId = useSelector(
    (state: RootState) => state.conversations.focusedConvId
  );
  const focusedMessages = useSelector(
    (state: RootState) => state.conversations.focusedConvData
  );
  const focusedConvMeta = useSelector(
    (state: RootState) => state.conversations.focusedConvMeta
  );
  const availableModels = useSelector(
    (state: RootState) => state.conversations.availableModels
  );
  const lastUsedModel = useSelector(
    (state: RootState) => state.conversations.lastUsedModel
  );

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Returns the current array of focused messages.
   */
  const getMessagesList = useCallback(() => {
    return focusedMessages;
  }, [focusedMessages, focusedConvId]);

  /**
   * Changes the currently selected model in both Redux and local state.
   */
  const handleModelChange = (modelName: string) => {
    dispatch(setLastUsedModel(modelName));
    if (focusedConvMeta) {
      dispatch(setFocusedConvMeta({ ...focusedConvMeta, model: modelName }));
    }
  };

  /**
   * Handles sending the user's message (prompt) to the AI model,
   * creating a new conversation if necessary.
   */
  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);

    let currentConversationId = focusedConvId;

    // 1) If no conversation is currently focused, create a brand new one.
    if (!currentConversationId) {
      const newConversation: ConversationMeta = {
        id: generateRandomId(12),
        created_at: dayjs().toISOString(),
        model: lastUsedModel || "mistral",
        title: "Conversation " + generateIdNumber(2),
      };
      await actions.createConversation(newConversation);

      dispatch(addConversation(newConversation));
      dispatch(setFocusedConvId(newConversation.id));
      dispatch(setFocusedConvMeta(newConversation));
      dispatch(setFocusedConvData([]));

      currentConversationId = newConversation.id;
    }

    // 2) Build a user message object.
    const userMessage: ConversationMessage = {
      id: generateRandomId(12),
      conversation_id: currentConversationId,
      message: userInput,
      created_at: dayjs().toISOString(),
      ai_replied: false,
      // user messages won't have a context array to store, so we store "[]"
      ctx: "[]",
    };

    // 3) Insert the user message in the DB and Redux state.
    await actions.sendPrompt(userMessage);
    dispatch(setFocusedConvData([...focusedMessages, userMessage]));

    // Clear user input.
    setUserInput("");

    // 4) Update conversation title if it’s the *very first* message.
    if (focusedMessages.length === 0 && focusedConvMeta) {
      const shortTitle = userInput.slice(0, 20);
      dispatch(setFocusedConvMeta({ ...focusedConvMeta, title: shortTitle }));
      actions.updateConversationName(shortTitle, focusedConvMeta.id);
    }

    // 5) Prepare last context from the second message, if available.
    let lastContext: number[] = [];
    if (focusedMessages.length > 1 && focusedMessages[1]?.ctx) {
      try {
        lastContext = JSON.parse(focusedMessages[1].ctx) || [];
      } catch (err) {
        lastContext = [];
      }
    }

    // 6) Send the user’s prompt to the AI.
    let aiResponse;
    try {
      aiResponse = await sendPrompt({
        model: focusedConvMeta?.model || "mistral",
        prompt: userInput,
        context: lastContext,
      });
    } catch (error) {
      console.error("AI request failed:", error);
      setIsLoading(false);
      return;
    }

    // 7) Build an AI message object.
    const aiMessage: ConversationMessage = {
      id: generateRandomId(12),
      conversation_id: currentConversationId,
      message: aiResponse.response,
      created_at: dayjs().toISOString(),
      ai_replied: true,
      // store the AI's context array as JSON
      ctx: JSON.stringify(aiResponse.context ?? []),
    };

    // 8) Insert the AI response message in the DB and Redux state.
    await actions.sendPrompt(aiMessage);
    dispatch(setFocusedConvData([...focusedMessages, userMessage, aiMessage]));

    setIsLoading(false);
  }, [
    userInput,
    focusedMessages,
    focusedConvId,
    focusedConvMeta,
    lastUsedModel,
    dispatch,
  ]);

  return (
    <div className="h-full">
      <ChatHeader />
      <div
        style={{ height: "calc(100% - 50px)" }}
        className="w-full bg-neutral-100 flex flex-col"
      >
        {/* MESSAGES LIST */}
        <div className="overflow-y-scroll flex flex-1 flex-col pt-4">
          {/* Prompt the user to select a model if there are no messages yet */}
          {focusedMessages.length === 0 && (
            <div className="flex-row flex py-1 items-center pl-4">
              <p className="mr-2 text-sm">Select model:</p>
              <Select
                value={lastUsedModel}
                onValueChange={(value) => handleModelChange(value)}
              >
                <SelectTrigger className="w-[180px] h-[30px] bg-white">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((modelItem, index) => (
                    <SelectItem key={index} value={modelItem.name}>
                      {modelItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Render the conversation messages */}
          {(getMessagesList() || []).map((messageItem) => (
            <ChatMessage {...messageItem} key={messageItem.id} />
          ))}
        </div>

        {/* USER INPUT */}
        <div className="flex flex-row p-4 pt-0">
          <Input
            disabled={isLoading}
            className="bg-white rounded-full"
            placeholder="Type your prompt"
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <Button
            size="sm"
            className="ml-2 rounded-full text-sm h-full px-4"
            disabled={isLoading || userInput.trim() === ""}
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
