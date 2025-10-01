import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./pages/home/MainPage.tsx";
import HostPage from "./pages/host/HostPage.tsx";
import AdminPage from "./pages/admin/AdminPage.tsx";
import PlayerPage from "./pages/player/PlayerPage.tsx";
import "./common/global.css";
import { UserProvider } from "./context/UserContext.tsx";
import { LobbyProvider } from "./context/LobbyContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <LobbyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="" element={<MainPage />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/player" element={<PlayerPage />} />
          </Routes>
        </BrowserRouter>
      </LobbyProvider>
    </UserProvider>
  </StrictMode>
);
