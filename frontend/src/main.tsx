import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";            
import "./styles/globals.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";   // adjust path if needed

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
