import { Box, Button, Typography } from "@mui/material";
import styles from "./MainPage.module.css";
import ThemeWrapper from "../../common/theme";
import { useNavigate } from "react-router-dom";
import { UserProvider } from "../../context/UserContext";
import { LobbyProvider } from "../../context/LobbyContext";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <ThemeWrapper>
      <Box className={styles.lobbyContainer}>
        <Typography variant="h1" className={styles.title}>
          Lobby Title Welcome
        </Typography>
        <Box className={styles.buttonContainer}>
          <Button className={styles.lobbyButton} variant="secondary">
            Host
          </Button>
          <Button
            className={styles.lobbyButton}
            variant="primary"
            onClick={() => navigate("/player")}
          >
            Join
          </Button>
        </Box>
      </Box>
    </ThemeWrapper>
  );
}
