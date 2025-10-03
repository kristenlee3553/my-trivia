import { Box, Typography, Button, Grid } from "@mui/material";
import styles from "./HostPage.module.css";
import { useNavigate } from "react-router-dom";
import ThemeWrapper from "../../common/theme";
import GameTile from "./GameTile";

export default function HostPage() {
  const navigate = useNavigate();

  const gameName = ["mario", "luigi", "zelda", "peach", "bowser"];

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
            Choose a game
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
        <Grid container spacing={5} className={styles.gameTileContainer}>
          {gameName.map((game) => {
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <GameTile name={game} />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </ThemeWrapper>
  );
}
