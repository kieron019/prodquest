import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import { env, flags } from "./lib/env";

const appNode = <App />;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {flags.hasClerk ? <ClerkProvider publishableKey={env.clerkPublishableKey}>{appNode}</ClerkProvider> : appNode}
  </React.StrictMode>
);
