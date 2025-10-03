import { Box, Typography, Button } from "@mui/material";
import styles from "./GameTile.module.css";

type GameTileProps = {
  name: string;
};

export default function GameTile({ name }: GameTileProps) {
  return (
    <Box className={styles.gameTileContainer}>
      <Typography variant="h2" className={styles.gameTitle}>
        {name}
      </Typography>
      <Button variant="primary">View Questions</Button>
      <Button variant="secondary">Create Lobby</Button>
      <Button variant="secondary">Customize Game Options</Button>
    </Box>
  );
}
