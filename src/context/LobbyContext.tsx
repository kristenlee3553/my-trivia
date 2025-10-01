import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Player, Lobby } from "../common/types";

type LobbyContextType = {
  lobby: Lobby | null;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | null>>;
};

const LobbyContext = createContext<LobbyContextType>({
  lobby: null,
  setLobby: () => {},
});

export function LobbyProvider({ children }: { children: ReactNode }) {
  const [lobby, setLobby] = useState<Lobby | null>(null);

  // Optional: could sync with Firebase here using onValue or get
  // useEffect(() => {
  //   if (!lobbyCode) return;
  //   const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
  //   return onValue(lobbyRef, (snapshot) => {
  //     setLobby(snapshot.val());
  //   });
  // }, [lobbyCode]);

  return (
    <LobbyContext.Provider value={{ lobby, setLobby }}>
      {children}
    </LobbyContext.Provider>
  );
}

export const useLobby = () => useContext(LobbyContext);
