import { Box, Button, Stack, Typography } from "@mui/material";
import styles from "./MainPage.module.css";
import ThemeWrapper from "../../common/theme";
import { useNavigate } from "react-router-dom";
import { useLobby } from "../../context/LobbyContext";
import { useUser } from "../../context/UserContext";
import { checkLobbyExists, addPlayerToLobby } from "../../firebase/lobby";
import { useState } from "react";
import BaseTextField from "../../common/components/Textfield";

export default function MainPage() {
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
      <Box className={styles.lobbyContainer}>
        <Box
          sx={{ justifyContent: "flex-end", width: "100%" }}
          display={{ xs: "none", lg: "flex" }}
        >
          <Button
            variant="primary"
            onClick={() => navigate("/host")}
            sx={{ maxWidth: "250px", width: "100%", borderRadius: "8px" }}
          >
            Host
          </Button>
        </Box>
        <Typography variant="h1" className={styles.title}>
          Welcome!
        </Typography>
        <Stack spacing={{ xs: 5, md: 3 }}>
          <Stack
            spacing={{ xs: 1, sm: 2, md: 3 }}
            minWidth={"33vw"}
            width={{
              xs: "65vw",
              md: "unset",
            }}
          >
            <BaseTextField
              labelText="Room Code"
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
              labelText="Nickname"
              onChange={(value: string) => setNickname(value)}
              slotProps={{
                textField: {
                  slotProps: { htmlInput: { maxLength: 15 } },
                  helperText: `${nickname.length} / 15`,
                },
              }}
            />
          </Stack>
          <Button
            className={styles.lobbyButton}
            variant="secondary"
            onClick={joinLobbyHandler}
            disabled={lobbyCode.length === 0}
          >
            Join
          </Button>
          <Button
            className={styles.lobbyButton}
            variant="secondary"
            onClick={() => navigate("/testing")}
          >
            TESTING
          </Button>
        </Stack>
      </Box>
    </ThemeWrapper>
  );
}
