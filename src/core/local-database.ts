import Database from "@tauri-apps/plugin-sql";
import { core } from "./core";

export let db: Database;

export const loadDB = async () => {
  try {
    db = await Database.load("sqlite:ollama-chat.db");
    console.info("Database loaded");
    await dropTables();
    core.database.patchObject({ ready: true });
    await prepareDatabase();
  } catch (error) {
    console.log("Something went wrong with loading the database", error);
  }
};

export const prepareDatabase = async () => {
  // Create the conversations table
  await db.execute(
    `CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    mode TEXT ,
    model TEXT NOT NULL,
    created_at DATETIME NOT NULL
  );`
  );

  // Create the conversation_messages table
  await db.execute(`
  CREATE TABLE IF NOT EXISTS conversation_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    ai_replied INTEGER NOT NULL,
    ctx TEXT,
    FOREIGN KEY(conversation_id) REFERENCES conversations(id)
  )
`);

  return true;
};

export const flushDatbase = async () => {
  await db.execute(`DELETE FROM conversation_messages;`);
  await db.execute(`DELETE FROM conversations;`);
};

export const dropTables = async () => {
  await db.execute("DROP TABLE IF EXISTS conversation_messages;");
  await db.execute("DROP TABLE IF EXISTS conversations;");
};
