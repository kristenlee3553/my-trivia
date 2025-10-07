import { Box, Button, Divider, Typography } from "@mui/material";
import styles from "./HostLobbyPage.module.css";
import { useLobby } from "../../context/LobbyContext";
import { removeLobby } from "../../firebase/lobby";
import { useNavigate } from "react-router-dom";
import ThemeWrapper from "../../common/theme";
import { ref, onValue } from "firebase/database";
import { useState, useRef, useEffect } from "react";
import type { Player } from "../../common/types";
import { db } from "../../firebase/firebase";
import { DATABASE } from "../../firebase/constants";

export default function HostLobbyPage() {
  const { lobby } = useLobby();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [recentJoins, setRecentJoins] = useState<string[]>([]);
  const prevPlayersRef = useRef<Record<string, Player>>({});

  useEffect(() => {
    if (!lobby?.lobbyCode) return;

    const playersRef = ref(
      db,
      `${DATABASE.LOBBY}/${lobby.lobbyCode}/${DATABASE.PLAYERS}`
    );
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const newPlayers = snapshot.val() || {};
      const prevPlayers = prevPlayersRef.current;

      // Detect new joins
      const newJoins = Object.keys(newPlayers).filter((id) => !prevPlayers[id]);

      if (newJoins.length > 0) setRecentJoins(newJoins);

      prevPlayersRef.current = newPlayers;
      setPlayers(newPlayers);
    });

    return () => unsubscribe();
  }, [lobby?.lobbyCode]);

  async function endLobbyHandler() {
    if (lobby?.lobbyCode) await removeLobby(lobby?.lobbyCode);
    navigate("/host");
  }

  return (
    <ThemeWrapper>
      <Box className={styles.hostLobbyPage}>
        <Box className={styles.topBar}>
          <Button variant="cancel" onClick={endLobbyHandler}>
            Back
          </Button>
          <Typography variant="h1" className={styles.gameName}>
            {lobby?.gameInfo.name}
          </Typography>
          <Button variant="secondary">Start</Button>
        </Box>
        <Divider />
        <Box className={styles.roomCodeContainer}>
          <Typography variant="h2" className={styles.lobbyCode}>
            {lobby?.lobbyCode}
          </Typography>
        </Box>
        <Box className={styles.playerContainer}></Box>
      </Box>
    </ThemeWrapper>
  );
}
