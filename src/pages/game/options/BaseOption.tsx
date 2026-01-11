import { Box, Button, Stack, useMediaQuery, useTheme } from "@mui/material";
import SomethingWentWrong from "../../error/SomethingWentWrong";
import {
  OPTION_COLOR_MAP,
  OPTION_COLORS,
  type OPTION_COLORS_KEYS,
} from "../../../common/theme";
import { useState } from "react";
import styles from "./index.module.css";
import type { MultiSelect, SingleSelect } from "../../../common/types";

type BaseOptionGridProps<T extends "single" | "multi"> = {
  /** Pass options in the order you want displayed */
  options: T extends "single"
    ? SingleSelect["options"]
    : MultiSelect["options"];
  onSubmit?: (
    answer: T extends "single"
      ? SingleSelect["correctAnswer"]
      : MultiSelect["correctAnswer"]
  ) => void;
  answerType: T;
  hideSubmitButton?: boolean;
};

export default function BaseOptionGrid<T extends "single" | "multi">({
  options,
  onSubmit,
  answerType,
  hideSubmitButton,
}: BaseOptionGridProps<T>) {
  const numOptions = options.length;
  if (numOptions < 2) {
    return <SomethingWentWrong optionalText="Must have at least 2 options!" />;
  }

  const [optionsSelected, setOptionsSelected] = useState<string[]>([]);

  return (
    <Stack spacing={2} className={styles.baseOptionGridContainer}>
      <Box
        className={styles.baseOptionGrid}
        gridTemplateColumns={
          numOptions === 2
            ? "1fr"
            : numOptions === 3
              ? "1fr"
              : numOptions === 4
                ? "1fr 1fr"
                : numOptions === 5
                  ? "1fr 1fr"
                  : "1fr 1fr"
        }
        gridTemplateRows={
          numOptions === 2
            ? "1fr 1fr"
            : numOptions === 3
              ? "1fr 1fr 1fr"
              : numOptions === 4
                ? "1fr 1fr"
                : numOptions === 5
                  ? "1fr 1fr 1fr"
                  : "1fr 1fr 1fr"
        }
      >
        {options.map((opt, i) =>
          onSubmit ? (
            <BaseOption
              key={i}
              text={opt}
              color={OPTION_COLORS[i]}
              singleSelect={answerType === "single"}
              onClick={(toggled: boolean) => {
                if (answerType === "single") {
                  (onSubmit as (val: string) => void)(opt);
                } else {
                  setOptionsSelected((prev) => {
                    if (toggled) {
                      // Add the new option if not already in the array
                      if (!prev.includes(opt)) {
                        return [...prev, opt];
                      }
                      return prev;
                    } else {
                      // Remove from the array
                      return prev.filter((o) => o !== opt);
                    }
                  });
                }
              }}
            />
          ) : (
            <HostBaseOption text={opt} color={OPTION_COLORS[i]} key={i} />
          )
        )}
      </Box>
      {!hideSubmitButton && answerType === "multi" && onSubmit && (
        <Button
          variant="primary"
          onClick={() => (onSubmit as (a: string[]) => void)(optionsSelected)}
          sx={{ width: "100%" }}
          disabled={optionsSelected.length === 0}
        >
          Submit
        </Button>
      )}
    </Stack>
  );
}

type BaseOptionProps = {
  onClick: (toggled: boolean) => void;
  text: string;
  color: OPTION_COLORS_KEYS;
  singleSelect: boolean;
};

function BaseOption({ onClick, text, color, singleSelect }: BaseOptionProps) {
  const [selected, setSelected] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    background,
    toggledBg,
    color: textColor,
    toggledColor,
    hoverBg,
  } = OPTION_COLOR_MAP[color];
  const toggled = !singleSelect && selected;
  const bgColor = singleSelect ? toggledBg : toggled ? toggledBg : background;

  return (
    <Button
      onClick={() => {
        onClick(!selected);
        setSelected(!selected);
      }}
      className={styles.baseOption}
      sx={{
        background: bgColor,
        color: singleSelect ? toggledColor : toggled ? toggledColor : textColor,
        borderRadius: toggled ? "4px" : "6px",
        transition: "all 0.15s ease-out",
        "&:hover": {
          background: isMobile ? bgColor : hoverBg,
        },
      }}
    >
      {text}
    </Button>
  );
}

type HostBaseOptionProps = {
  text: string;
  color: OPTION_COLORS_KEYS;
};

export function HostBaseOption({ text, color }: HostBaseOptionProps) {
  const { toggledBg, toggledColor } = OPTION_COLOR_MAP[color];
  return (
    <div
      className={styles.baseOption}
      style={{
        backgroundColor: toggledBg,
        color: toggledColor,
      }}
    >
      {text}
    </div>
  );
}
