import { Box, Button, Typography } from "@mui/material";
import ThemeWrapper from "../../common/theme";
import styles from "./PlayerPage.module.css";
import BaseTextField from "../../common/Textfield";
import { useState } from "react";

export default function PlayerPage() {
  const [lobbyCode, setLobbyCode] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");

  return (
    <ThemeWrapper>
      <Box className={styles.playerContainer}>
        <Typography variant="h1" className={styles.title}>
          Player Page Title
        </Typography>
        <Box className={styles.inputContainer}>
          <BaseTextField
            labelText="Enter Room Code"
            onChange={(value: string) => setLobbyCode(value)}
          />
          <BaseTextField
            labelText="Enter Nickname"
            onChange={(value: string) => setNickname(value)}
          />
        </Box>
        <Button variant="secondary" className={styles.enterButton}>
          Enter
        </Button>
      </Box>
    </ThemeWrapper>
  );
}
