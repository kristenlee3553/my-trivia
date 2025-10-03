import { Box, Button, Typography } from "@mui/material";
import ThemeWrapper from "../../common/theme";
import styles from "./PlayerPage.module.css";
import BaseTextField from "../../common/Textfield";
import { useState } from "react";
import { addPlayerToLobby, checkLobbyExists } from "../../firebase/lobby";
import type { Lobby, Player } from "../../common/types";
import { useUser } from "../../context/UserContext";
import { useLobby } from "../../context/LobbyContext";
import { useNavigate } from "react-router-dom";

export default function PlayerPage() {
  const navigate = useNavigate();
  const [lobbyCode, setLobbyCode] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [lobbyError, setLobbyError] = useState<boolean>(false);

  const userContext = useUser();
  const lobbyContext = useLobby();

  async function joinLobbyHandler() {
    if (await checkLobbyExists(lobbyCode)) {
      console.log("App User: ", userContext.appUser);
      if (!userContext.appUser) {
        console.error(
          "Unable to authenticate. Please try refreshing the page."
        );
        return;
      }
      const player = await addPlayerToLobby(
        lobbyCode,
        userContext.appUser.uid,
        nickname
      );

      if (player) {
        // UNCOMMENT AFTER HOST LOGIC IS DONE
        /*         lobbyContext.setLobby((prevLobby) => {
          if (!prevLobby) return null;
          return {
            ...prevLobby,
            players: {
              ...prevLobby.players,
              [player.uid]: player,
            },
          };
        }); */
        userContext.setAppUser({
          ...userContext.appUser,
          isHost: false,
          lobbyCode: lobbyCode,
          playerData: player,
        });
      } else {
        console.error("Unable to join the lobby.");
      }
    } else {
      setLobbyError(true);
    }
  }

  return (
    <ThemeWrapper>
      <Box className={styles.playerContainer}>
        <Typography variant="h1" className={styles.title}>
          Player Setup
        </Typography>
        <Box className={styles.inputContainer}>
          <BaseTextField
            labelText="Enter Room Code"
            onChange={(value: string) => {
              setLobbyCode(value);
              setLobbyError(false);
            }}
            slotProps={{
              textField: {
                error: lobbyError,
                helperText: lobbyError ? "Cannot find lobby" : undefined,
              },
            }}
          />
          <BaseTextField
            labelText="Enter Nickname"
            onChange={(value: string) => setNickname(value)}
          />
        </Box>
        <Box className={styles.buttonContainer}>
          <Button
            variant="secondary"
            className={styles.playerButton}
            onClick={joinLobbyHandler}
            disabled={lobbyCode.length === 0}
          >
            Enter
          </Button>
          <Button
            variant="cancel"
            className={styles.playerButton}
            onClick={() => navigate("/")}
          >
            Back
          </Button>
        </Box>
      </Box>
    </ThemeWrapper>
  );
}
