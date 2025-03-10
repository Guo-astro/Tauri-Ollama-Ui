import { db } from "./local-database";

interface createConversationProps {
  id: string;
  title: string;
  created_at: Date;
  model: string;
}

export const createConversation = async (p: createConversationProps) => {
  console.log(Object.entries(p).map((item) => item[1]));

  try {
    await db.execute(
      "INSERT INTO conversations (id, title, created_at, model) VALUES ($1, $2, $3, $4)",
      [p.id, p.title, p.created_at, p.model]
    );
    return true;
  } catch (error) {
    console.log(error);
  }
};

export const getConversations = async () => {
  return await db.select("SELECT * FROM conversations");
};

export const getConversationMessages = async (id: string) => {
  return await db.select(
    "SELECT id, conversation_id, message, created_at, ai_replied, ctx FROM conversation_messages WHERE conversation_id = $1;",
    [id]
  );
};

interface SendPrompProps {
  id: string;
  conversation_id: string;
  message: string;
  created_at: string;
  ai_replied: boolean;
  ctx: string;
}

export const sendPrompt = async (p: SendPrompProps) => {
  await db.execute(
    "INSERT INTO conversation_messages (id, conversation_id, message, created_at, ai_replied, ctx) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      p.id,
      p.conversation_id,
      p.message,
      p.created_at,
      p?.ai_replied ? 1 : 0,
      p?.ctx || null,
    ]
  );
  return true;
};

export const updateConversationName = async (name: string, conv_id: string) => {
  await db.execute("UPDATE conversations SET title = $1 WHERE id = $2", [
    name,
    conv_id,
  ]);
};

export const deleteConversation = async (id: string) => {
  await db.execute("DELETE FROM conversations WHERE id = $1;", [id]);
  await db.execute(
    "DELETE FROM conversation_messages WHERE conversation_id = $1;",
    [id]
  );
  return true;
};
