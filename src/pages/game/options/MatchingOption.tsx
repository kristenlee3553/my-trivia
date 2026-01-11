import { Button, useTheme } from "@mui/material";
import type { Matching } from "../../../common/types";
import styles from "./index.module.css";
import { useState } from "react";
import { OPTION_COLOR_MAP, OPTION_COLORS } from "../../../common/theme";

type Selection = { id: string; side: "left" | "right" } | null;

type MatchingOptionProps = {
  options: Matching["options"];
  onSubmit?: (answer: Matching["correctAnswer"]) => void;
};

export default function MatchingOption({
  options,
  onSubmit,
}: MatchingOptionProps) {
  const theme = useTheme();
  const [activeSelection, setActiveSelection] = useState<Selection>(null);
  const [pairs, setPairs] = useState<Matching["correctAnswer"]>({});

  const leftArray = Array.from(options.left);
  const rightArray = Array.from(options.right);
  const numPairsMatched = Object.keys(pairs).length;
  const allPairMatched = numPairsMatched === options.left.size;

  const handleTap = (id: string, side: "left" | "right") => {
    // 1. UNDO: If clicking the same item again, deselect it
    if (activeSelection?.id === id) {
      setActiveSelection(null);
      return;
    }

    // 2. BREAK: If clicking an already matched item, break the pair
    const matchedLeft =
      side === "left" ? id : Object.keys(pairs).find((k) => pairs[k] === id);
    if (matchedLeft && pairs[matchedLeft]) {
      const newPairs = { ...pairs };
      delete newPairs[matchedLeft];
      setPairs(newPairs);
      setActiveSelection({ id, side }); // Optional: set the clicked item as the new start
      return;
    }

    // 3. MATCH: If we have a selection from the OPPOSITE side, pair them
    if (activeSelection && activeSelection.side !== side) {
      const leftId = side === "left" ? id : activeSelection.id;
      const rightId = side === "right" ? id : activeSelection.id;

      setPairs((prev) => ({ ...prev, [leftId]: rightId }));
      setActiveSelection(null);
      return;
    }

    // 4. START: Otherwise, start a new selection
    setActiveSelection({ id, side });
  };

  return (
    <div className={styles.matchingContainer}>
      <div className={styles.matchingGrid}>
        <div className={styles.matchingColumn}>
          {leftArray.map((opt, index) => {
            const colorKey = OPTION_COLORS[index % OPTION_COLORS.length];
            const colorDetails = OPTION_COLOR_MAP[colorKey];
            const isSelected =
              activeSelection?.side === "left" && activeSelection.id === opt;
            const isMatched = !!pairs[opt];

            return (
              <Button
                key={opt}
                sx={{
                  background:
                    isSelected || isMatched || !onSubmit
                      ? colorDetails.toggledBg
                      : colorDetails.background,
                  color:
                    isSelected || isMatched || !onSubmit
                      ? colorDetails.toggledColor
                      : colorDetails.color,
                  border: isSelected
                    ? `2px solid ${theme.palette.secondary.main}`
                    : "none",
                  boxShadow: isSelected
                    ? `0 0 15px ${colorDetails.background}`
                    : "none",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: onSubmit
                      ? colorDetails.hoverBg
                      : colorDetails.toggledBg,
                  },
                  pointerEvents: onSubmit ? "auto" : "none",
                }}
                onClick={() => handleTap(opt, "left")}
              >
                {opt}
              </Button>
            );
          })}
        </div>
        <div className={styles.matchingColumn}>
          {rightArray.map((opt) => {
            const pairedLeftEntry = Object.entries(pairs).find(
              ([_left, right]) => right === opt
            );
            const leftValue = pairedLeftEntry ? pairedLeftEntry[0] : null;
            const leftIndex = leftValue ? leftArray.indexOf(leftValue) : -1;

            const colorKey =
              leftIndex !== -1
                ? OPTION_COLORS[leftIndex % OPTION_COLORS.length]
                : null;
            const colorDetails = colorKey ? OPTION_COLOR_MAP[colorKey] : null;
            const isSelected =
              activeSelection?.side === "right" && activeSelection.id === opt;

            return (
              <Button
                key={opt}
                variant="secondary"
                sx={{
                  backgroundColor: colorDetails
                    ? colorDetails.toggledBg
                    : "rgba(182, 225, 250, 0.05)",
                  color: colorDetails
                    ? colorDetails.toggledColor
                    : theme.palette.secondary.main,
                  border: isSelected
                    ? `2px solid ${theme.palette.secondary.main}`
                    : colorDetails
                      ? "none"
                      : `2px dashed ${theme.palette.secondary.main}`,
                  fontWeight: colorDetails ? "bold" : "400",
                  boxShadow: isSelected
                    ? `0 0 15px ${theme.palette.secondary.main}`
                    : "none",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: colorDetails
                      ? colorDetails.hoverBg
                      : "rgba(182, 225, 250, 0.15)",
                  },
                  pointerEvents: onSubmit ? "auto" : "none",
                }}
                onClick={() => handleTap(opt, "right")}
              >
                {opt}
              </Button>
            );
          })}
        </div>
      </div>
      {onSubmit && (
        <div className={styles.controlContainer}>
          <Button
            variant="cancel"
            disabled={numPairsMatched === 0}
            onClick={() => {
              setPairs({});
              setActiveSelection(null);
            }}
          >
            Restart
          </Button>
          <Button
            variant="primary"
            disabled={!allPairMatched}
            onClick={() => onSubmit(pairs)}
          >
            Lock in
          </Button>
        </div>
      )}
    </div>
  );
}
