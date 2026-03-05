import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import { env } from "./lib/env";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={env.clerkPublishableKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
