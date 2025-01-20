// src/store/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import { conversationsReducer } from "./conversationsSlice";

const rootReducer = combineReducers({
  conversations: conversationsReducer,
  // Add other slices here
});

export default rootReducer;
