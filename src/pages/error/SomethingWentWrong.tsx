import { Box, Typography } from "@mui/material";
import styles from "./index.module.css";

export default function SomethingWentWrong() {
  return (
    <Box className={styles.backgroundContainer}>
      <Typography variant="h1" className={styles.title}>
        Something went wrong...
      </Typography>
      <Typography className={styles.description}>
        You weren't supposed to see this page...
      </Typography>
    </Box>
  );
}
