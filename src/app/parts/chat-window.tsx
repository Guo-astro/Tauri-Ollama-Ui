import { ChatHeader } from "./chat-header";
import { Input } from "@/components/ui/input";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
} from "react";
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
  const focused_conv_id = useSelector(
    (state: RootState) => state.conversations.focusedConvId
  );
  const messages = useSelector(
    (state: RootState) => state.conversations.focusedConvData
  );
  const conversation_meta = useSelector(
    (state: RootState) => state.conversations.focusedConvMeta
  );
  const available_models = useSelector(
    (state: RootState) => state.conversations.availableModels
  );
  const last_used_model = useSelector(
    (state: RootState) => state.conversations.lastUsedModel
  );

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesList = useCallback(() => {
    return messages;
  }, [messages, focused_conv_id]);

  const changeModel = (model_name: string) => {
    dispatch(setLastUsedModel(model_name));
    if (conversation_meta) {
      dispatch(setFocusedConvMeta({ ...conversation_meta, model: model_name }));
    }
  };

  const sendPromptMessage = useCallback(async () => {
    setLoading(true);

    let conversationId = focused_conv_id;

    // Check if we need to create a new conversation first
    if (!conversationId) {
      const v: ConversationMeta = {
        id: generateRandomId(12),
        created_at: dayjs().toISOString(),
        model: last_used_model,
        title: "Conversation " + generateIdNumber(2),
      };

      await actions.createConversation(v);
      dispatch(addConversation(v));
      dispatch(setFocusedConvId(v.id));
      dispatch(setFocusedConvMeta(v));
      dispatch(setFocusedConvData([]));

      conversationId = v.id;
    }

    const m = msg;
    setMsg("");

    const v1: ConversationMessage = {
      id: generateRandomId(12),
      conversation_id: conversationId,
      message: m,
      created_at: dayjs().toISOString(),
      ai_replied: false,
      ctx: "",
    };

    // Save the prompt in the database
    await actions.sendPrompt(v1);

    // Update local state with new message
    dispatch(setFocusedConvData([...messages, v1]));

    let lastCtx: any[] = [];
    if (messages.length > 1) {
      lastCtx = JSON.parse((messages[1].ctx as string) || "[]");
    }

    if (messages.length === 0 && conversation_meta) {
      const x = m.slice(0, 20);
      dispatch(setFocusedConvMeta({ ...conversation_meta, title: x }));
      actions.updateConversationName(x, conversation_meta.id);
    }

    // Send prompt to the AI
    const res = await sendPrompt({
      model: conversation_meta?.model || "mistral",
      prompt: m,
      context: lastCtx,
    });

    const v2: ConversationMessage = {
      ai_replied: true,
      conversation_id: conversationId,
      created_at: dayjs().toISOString(),
      id: generateRandomId(12),
      message: res.response,
      ctx: res.context,
    };

    // Save the AI response in the database
    await actions.sendPrompt(v2);

    // Update local state with AI response
    dispatch(setFocusedConvData([...messages, v1, v2]));

    setLoading(false);
  }, [
    msg,
    messages,
    focused_conv_id,
    last_used_model,
    conversation_meta,
    dispatch,
  ]);

  return (
    <div className="h-full">
      <ChatHeader />
      <div
        style={{ height: "calc(100% - 50px)" }}
        className="w-full bg-neutral-100 flex flex-col"
      >
        <div className="overflow-y-scroll flex flex-1 flex-col pt-4">
          {messages.length === 0 && (
            <div className="flex-row flex py-1 items-center pl-4">
              <p className="mr-2 text-sm">Select model: </p>
              <Select
                value={last_used_model}
                onValueChange={(v) => changeModel(v)}
              >
                <SelectTrigger className="w-[180px] h-[30px] bg-white">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {available_models.map(
                    (
                      item: {
                        name:
                          | string
                          | number
                          | boolean
                          | ReactElement<
                              any,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined;
                      },
                      index: Key | null | undefined
                    ) => (
                      <SelectItem key={index} value={item.name}>
                        {item.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          {(messagesList() || []).map((item) => (
            <ChatMessage {...item} key={item.id} />
          ))}
        </div>
        <div className="flex flex-row p-4 pt-0">
          <Input
            disabled={loading}
            className="bg-white rounded-full"
            placeholder="Type your prompt"
            onChange={(x) => setMsg(x.target.value)}
            value={msg}
            onKeyDown={(x) => {
              if (x.code === "Enter") {
                sendPromptMessage();
              }
            }}
          />
          <Button
            size="sm"
            className="ml-2 rounded-full text-sm h-full px-4"
            disabled={loading || msg === ""}
            onClick={sendPromptMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
