export * from "./utils";
export * from "./core";
export * from "./helper";
export * as actions from "./database-actions";
export * from "./actions";
export const OLLAMA_HOST = `127.0.0.1:11434`;
export const OLLAMA_COMMAND = `OLLAMA_ORIGINS=* OLLAMA_HOST=${OLLAMA_HOST} ollama serve`;
