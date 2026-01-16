import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./admin/AdminPage";
import MainPage from "./home/MainPage";
import HostPage from "./host/HostPage";
import LobbyPage from "./lobby/LobbyPage";
import PreviewPage from "./preview";
import GameManager from "./game";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<MainPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/testing" element={<GameManager />} />
      </Routes>
    </BrowserRouter>
  );
}
