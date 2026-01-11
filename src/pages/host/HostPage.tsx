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
import BaseCheckbox from "../../common/components/Checkbox.tsx";
import { useId, useState } from "react";
import introGame from "../../games/intro.ts";
import {
  type GameAuthor,
  type GameRuntime,
  type Lobby,
} from "../../common/types";
import { useUser } from "../../context/UserContext.tsx";
import {
  createLobby,
  createRuntimeGame,
  generateUniqueLobbyCode,
} from "../../firebase/lobby.ts";
import { useLobby } from "../../context/LobbyContext.tsx";
import exposedQuiz from "../../games/exposed.ts";

export type GameType = "intro" | "groupChat" | "spotify" | "exposed";

// TEMP EXPORT FOR DEBUG
export const gameFiles: Record<GameType, GameAuthor> = {
  intro: introGame,
  exposed: exposedQuiz,
  groupChat: introGame,
  spotify: introGame,
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

      const preparedGame = prepareGameForLobby(runtimeGame, {
        shuffleAnswers,
        shuffleQuestions,
      });

      const hostId = userContext.appUser.uid;

      // Create Lobby Object
      const lobbyObj: Lobby = {
        lobbyCode,
        hostId: hostId,
        players: {},
        startTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        lobbyStatus: "notStarted",
        gameData: preparedGame,
        currentQuestion: "",
        questionOrder: preparedGame.questions.map((q) => q.id),
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

function prepareGameForLobby(
  game: GameRuntime,
  options: Lobby["gameOptions"]
): GameRuntime {
  let processedQuestions = [...game.questions];

  // 1. Shuffle the Questions if enabled
  if (options.shuffleQuestions) {
    processedQuestions = shuffleArray(processedQuestions);
  }

  // 2. Shuffle the Answers (Options) within each question if enabled
  if (options.shuffleAnswers) {
    processedQuestions = processedQuestions.map((q) => {
      // Create a shallow copy of the question
      const question = { ...q };

      switch (question.answerType) {
        case "single":
        case "multi":
        case "ranking":
          // These use simple string arrays for options
          return {
            ...question,
            options: shuffleArray(question.options as string[]),
          };

        case "matching":
          // Matching has left and right sets.
          // We convert to arrays, shuffle, and convert back to Sets.
          return {
            ...question,
            options: {
              left: new Set(shuffleArray(Array.from(question.options.left))),
              right: new Set(shuffleArray(Array.from(question.options.right))),
            },
          };

        case "draw":
        case "shortAnswer":
          // No options to shuffle for these types
          return question;

        default:
          return question;
      }
    });
  }

  return {
    ...game,
    questions: processedQuestions,
  };
}
