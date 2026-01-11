import { Button, Typography } from "@mui/material";
import type { Ranking } from "../../../common/types";
import styles from "./index.module.css";
import { Reorder } from "framer-motion";
import { useState } from "react";
import { OPTION_COLOR_MAP, OPTION_COLORS } from "../../../common/theme";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import BaseOptionGrid from "./BaseOption";

type RankingOptionPlayerProps = Pick<
  Ranking,
  "leftLabel" | "rightLabel" | "options"
> & {
  onSubmit: (answer: Ranking["correctAnswer"]) => void;
};

export default function RankingOptionPlayer({
  leftLabel,
  rightLabel,
  options,
  onSubmit,
}: RankingOptionPlayerProps) {
  const [items, setItems] = useState<Ranking["options"]>(options);
  return (
    <div className={styles.rankingContainer}>
      <Typography className={styles.leftLabel}>{leftLabel}</Typography>
      <Reorder.Group
        className={styles.reorderContainer}
        axis="y"
        values={items}
        onReorder={(newOrder) => setItems(newOrder)}
      >
        {items.map((item) => {
          const originalIndex = options.indexOf(item);

          // 2. Use that fixed index to get the color
          const colorKey = OPTION_COLORS[originalIndex % OPTION_COLORS.length];
          const colorDetails = OPTION_COLOR_MAP[colorKey];

          return (
            <Reorder.Item
              key={item}
              value={item}
              style={{ position: "relative" }}
            >
              <div
                style={{
                  background: colorDetails.toggledBg,
                }}
                className={styles.reorderItem}
              >
                {/* The Item Text */}
                <Typography sx={{ color: colorDetails.toggledColor }}>
                  {item}
                </Typography>

                {/* Drag Handle Icon */}
                <DragIndicatorIcon
                  sx={{ color: colorDetails.toggledColor, opacity: 0.7 }}
                />
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <Typography className={styles.rightLabel}>{rightLabel}</Typography>
      <Button
        className={styles.submitButton}
        variant="secondary"
        onClick={() => onSubmit(items)}
      >
        Lock In
      </Button>
    </div>
  );
}

type RankingOptionHostProps = Pick<
  Ranking,
  "leftLabel" | "rightLabel" | "options"
>;

export function RankingOptionHost({
  leftLabel,
  options,
  rightLabel,
}: RankingOptionHostProps) {
  return (
    <div className={styles.rankingContainer}>
      <div className={styles.hostRankingHeader}>
        {/* Left Label (Lowest) */}
        <Typography className={styles.label}>{leftLabel}</Typography>

        {/* The Dynamic Arrow Container */}
        <div className={styles.arrowContainer}>
          <div className={styles.arrowLine} />
          <div className={styles.arrowHead} />
        </div>

        {/* Right Label (Highest) */}
        <Typography className={styles.label}>{rightLabel}</Typography>
      </div>
      <BaseOptionGrid answerType="single" options={options} />
    </div>
  );
}
