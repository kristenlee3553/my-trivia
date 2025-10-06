import ThemeWrapper from "../../common/theme";
import { useUser } from "../../context/UserContext";
import HostLobbyPage from "./HostLobbyPage";
import PlayerLobbyPage from "./PlayerLobbyPage";

export default function LobbyPage() {
  const userContext = useUser();

  const isHost = userContext.appUser?.isHost;

  return (
    <ThemeWrapper>
      {isHost ? <HostLobbyPage /> : <PlayerLobbyPage />}
    </ThemeWrapper>
  );
}
