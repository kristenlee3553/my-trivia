import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { cleanStaleLobbies } from "../firebase/lobby";
import AdminPage from "./admin/AdminPage";
import MainPage from "./home/MainPage";
import HostPage from "./host/HostPage";
import LobbyPage from "./lobby/LobbyPage";
import PlayerPage from "./player/PlayerPage";
import PreviewPage from "./preview";

export default function App() {
  useEffect(() => {
    cleanStaleLobbies();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<MainPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
