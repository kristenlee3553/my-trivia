import { Box, Button, Stack, Typography } from "@mui/material";
import styles from "./MainPage.module.css";
import ThemeWrapper from "../../common/theme";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <ThemeWrapper>
      <Box className={styles.lobbyContainer}>
        <Typography variant="h1" className={styles.title}>
          Welcome!
        </Typography>
        <Stack spacing={{ xs: 5, md: 3 }}>
          <Button
            className={styles.lobbyButton}
            variant="primary"
            onClick={() => navigate("/host")}
          >
            Host
          </Button>
          <Button
            className={styles.lobbyButton}
            variant="secondary"
            onClick={() => navigate("/player")}
          >
            Join
          </Button>
        </Stack>
      </Box>
    </ThemeWrapper>
  );
}
