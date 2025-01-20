import { Button } from "@/components/ui/button";
import { actions, generateIdNumber, generateRandomId } from "@/core";
import { ConversationMeta } from "@/core/types";
import {
  addConversation,
  setFocusedConvData,
  setFocusedConvId,
  setFocusedConvMeta,
} from "@/store/conversationsSlice";
import { RootState } from "@/store/store";
import { GearIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import { Key } from "react";
import { useDispatch, useSelector } from "react-redux";
import { twMerge } from "tailwind-merge";

export const Sidebar = () => {
  const dispatch = useDispatch();
  const lastUsedModel = useSelector(
    (state: RootState) => state.conversations.lastUsedModel
  );
  const convs = useSelector(
    (state: RootState) => state.conversations.conversations
  );
  const focused_conv_id = useSelector(
    (state: RootState) => state.conversations.focusedConvId
  );

  const newConversation = async () => {
    console.info("new conversation");
    const v: ConversationMeta = {
      id: generateRandomId(12),
      created_at: dayjs().toDate(),
      model: lastUsedModel,
      title: "Conversation " + generateIdNumber(2),
    };

    // Persist new conversation to DB
    await actions.createConversation(v);

    // Dispatch Redux actions to update state
    dispatch(setFocusedConvId(v.id));
    dispatch(setFocusedConvMeta(v));
    dispatch(setFocusedConvData([]));
    dispatch(addConversation(v));
  };

  const loadConversation = async (conv: ConversationMeta) => {
    // Update Redux state for focused conversation
    dispatch(setFocusedConvId(conv.id));
    dispatch(setFocusedConvMeta(conv));

    // Get messages from the conversation
    const res = await actions.getConversationMessages(conv.id);

    // Update focused conversation data in Redux
    dispatch(setFocusedConvData(res as any));
  };

  return (
    <div className="flex flex-col w-[340px] border-r-[1px] border-solid border-r-neutral-200">
      <div className="p-4 w-full flex-row flex">
        <Button className="w-full" onClick={newConversation} variant="outline">
          New Conversation
        </Button>
        <Button
          variant="outline"
          className="ml-2"
          onClick={() => {
            // Trigger settings event remains unchanged
            // You might need to migrate this if desired
            // core._events.trigger_settings.send();
          }}
        >
          <GearIcon />
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden w-full">
        <div className="p-4 h-full overflow-y-auto w-full">
          {!!convs?.length &&
            convs.map(
              (item: ConversationMeta, index: Key | null | undefined) => (
                <div
                  className={twMerge(
                    "mb-2 py-2 px-4 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer",
                    focused_conv_id === item?.id ? "bg-neutral-100" : ""
                  )}
                  key={index}
                  onClick={() => loadConversation(item)}
                >
                  <p className="select-none">{item.title}</p>
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
};
