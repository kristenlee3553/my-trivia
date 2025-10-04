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
import type { Game } from "../../common/types";

export type GameType = "intro" | "groupChat" | "spotify";

const gameFiles: Record<GameType, Game> = {
  intro: introJson,
  groupChat: introJson,
  spotify: introJson,
};

export default function HostPage() {
  const navigate = useNavigate();

  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [shuffleAnswers, setShuffleAnswers] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>("intro");

  const toggleContainerId = useId();

  // Make sure to add ID to questions
  // parsedQuestion.id ??= uuidv4();

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
        <Box className={styles.middleBar}>
          <Typography
            variant="h2"
            id={toggleContainerId}
            className={styles.selectGameTitle}
          >
            1. Select a game
          </Typography>
          <Box className={styles.gameControls}>
            <Typography variant="h2" className={styles.gameControlsTitle}>
              2. Game Controls{" "}
            </Typography>
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
            <Button variant="primary" className={styles.gameControlButton}>
              View Questions
            </Button>
            <Button
              variant="secondary"
              className={styles.gameControlButton}
              disabled={!selectedGame}
            >
              Create Lobby
            </Button>
          </Box>
        </Box>
        <Divider />
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
