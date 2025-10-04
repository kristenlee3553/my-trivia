import { Typography, ToggleButton } from "@mui/material";
import styles from "./HostPage.module.css";
import type { GameType } from "./HostPage";

type GameTileProps = {
  name: string;
  value: GameType;
};

export default function GameTile({ name, value }: GameTileProps) {
  return (
    <ToggleButton value={value} className={styles.toggleButtonContainer}>
      <Typography variant="h3" className={styles.gameTitle}>
        {name}
      </Typography>
    </ToggleButton>
  );
}
