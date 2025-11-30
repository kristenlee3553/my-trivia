import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./common/global.css";
import { UserProvider } from "./context/UserContext.tsx";
import { LobbyProvider } from "./context/LobbyContext.tsx";
import App from "./pages/app.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <LobbyProvider>
        <App />
      </LobbyProvider>
    </UserProvider>
  </StrictMode>
);
