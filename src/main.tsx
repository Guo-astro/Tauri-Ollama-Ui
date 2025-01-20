import React from "react";
import ReactDOM from "react-dom/client";
import { AppFrame } from "./app/index";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppFrame />
    </Provider>
  </React.StrictMode>
);
