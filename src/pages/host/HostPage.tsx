import {
  Box,
  Typography,
  Button,
  Grid,
  ToggleButtonGroup,
  Divider,
} from "@mui/material";
import styles from "./HostPage.module.css";
import { useNavigate } from "react-router-dom";
import ThemeWrapper from "../../common/theme";
import GameTile from "./GameTile";
import BaseCheckbox from "../../common/Checkbox";
import { useId, useState } from "react";
import introJson from "../../games/intro.json.ts";
import {
  GameAuthorSchema,
  type GameAuthor,
  type Lobby,
} from "../../common/types";
import { useUser } from "../../context/UserContext.tsx";
import {
  createLobby,
  createRuntimeGame,
  generateUniqueLobbyCode,
} from "../../firebase/lobby.ts";
import { useLobby } from "../../context/LobbyContext.tsx";

export type GameType = "intro" | "groupChat" | "spotify";

// TEMP EXPORT FOR DEBUG
export const gameFiles: Record<GameType, GameAuthor> = {
  intro: GameAuthorSchema.parse(introJson),
  groupChat: GameAuthorSchema.parse(introJson),
  spotify: GameAuthorSchema.parse(introJson),
};

export default function HostPage() {
  const navigate = useNavigate();
  const userContext = useUser();
  const { setLobby } = useLobby();

  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [shuffleAnswers, setShuffleAnswers] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>("intro");
  const [creating, setCreating] = useState<boolean>(false);

  const toggleContainerId = useId();

  async function createLobbyHandler() {
    if (!userContext?.appUser?.uid) {
      console.error("No authenticated user found — sign in first");
      return;
    }

    if (!selectedGame) {
      console.error("No selected game");
      return;
    }
    setCreating(true);

    try {
      // Lobby Code
      const lobbyCode = await generateUniqueLobbyCode();

      // Runtime Game
      const runtimeGame = createRuntimeGame(gameFiles[selectedGame]);

      // determine question order (use IDs as created)
      const questionOrder = runtimeGame.questions.map((q) => q.id);

      // optionally shuffle questionOrder if shuffleQuestions is true
      const maybeOrder = shuffleQuestions
        ? shuffleArray([...questionOrder])
        : questionOrder;

      const hostId = userContext.appUser.uid;

      // Create Lobby Object
      const lobbyObj: Lobby = {
        lobbyCode,
        hostId: hostId,
        players: {},
        startTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        lobbyStatus: "notStarted",
        gameInfo: runtimeGame,
        currentQuestion: "",
        questionOrder: maybeOrder,
        currentIndex: 0,
        gameOptions: {
          shuffleQuestions,
          shuffleAnswers,
        },
      };

      // Update Datebase
      const res = await createLobby(lobbyObj, lobbyCode);

      if (res) {
        // Create Lobby Context
        setLobby(lobbyObj);

        // Update User Context
        userContext.setAppUser({
          ...userContext.appUser,
          isHost: true,
          lobbyCode: lobbyCode,
        });

        // Update Local Storage
        localStorage.setItem("currentLobbyCode", lobbyCode);
        localStorage.setItem("currentUid", hostId);

        // Go to Lobby page
        navigate("/lobby");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <ThemeWrapper>
      <Box className={styles.hostPageContainer}>
        <Box className={styles.topBar}>
          <Button
            variant="cancel"
            onClick={() => navigate("/")}
            className={styles.hostButtons}
          >
            Back
          </Button>
          <Typography variant="h1" className={styles.hostPageTitle}>
            Lobby Creation
          </Typography>
          <Button
            variant="secondary"
            className={styles.invisible}
            tabIndex={-1}
            aria-hidden="true"
          >
            Help
          </Button>
        </Box>
        <Divider />
        <Box className={styles.gameControls}>
          <BaseCheckbox
            checked={shuffleQuestions}
            onChange={setShuffleQuestions}
            label="Shuffle Questions"
            labelPlacement="top"
          />
          <BaseCheckbox
            checked={shuffleAnswers}
            onChange={setShuffleAnswers}
            label="Shuffle Answers"
            labelPlacement="top"
          />
          <Button
            variant="primary"
            className={styles.gameControlButton}
            disabled={!selectedGame || creating}
            onClick={() => navigate("/preview")}
          >
            View Questions
          </Button>
          <Button
            variant="secondary"
            className={styles.gameControlButton}
            disabled={!selectedGame || creating}
            onClick={createLobbyHandler}
          >
            Create Lobby
          </Button>
        </Box>
        <Divider />
        <Typography
          variant="h2"
          id={toggleContainerId}
          className={styles.selectGameTitle}
        >
          Select a game
        </Typography>
        <ToggleButtonGroup
          value={selectedGame}
          exclusive
          onChange={(_, value) => setSelectedGame(value)}
          aria-labelledby={toggleContainerId}
        >
          <Grid container spacing={5} className={styles.gameTileContainer}>
            {Object.keys(gameFiles).map((game) => {
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={game}>
                  <GameTile
                    name={gameFiles[game as GameType].name}
                    value={game as GameType}
                  />
                </Grid>
              );
            })}
          </Grid>
        </ToggleButtonGroup>
      </Box>
    </ThemeWrapper>
  );
}

// tiny utility: Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
