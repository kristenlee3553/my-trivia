import { Box, Button, Stack } from "@mui/material";
import type { AnswerType, Options } from "../../../common/types";
import SomethingWentWrong from "../../error/SomethingWentWrong";
import {
  OPTION_COLOR_MAP,
  OPTION_COLORS,
  type OPTION_COLORS_KEYS,
} from "../../../common/theme";
import { useState } from "react";
import styles from "./BaseOption.module.css";

export type BaseOptions = Extract<Options, { answerType: "single" | "multi" }>;

type BaseOptionGridProps = {
  /**Pass options in the order you want displayed */
  options: string[];
  onSubmit: (answer: string | string[]) => void;
  isHost: boolean;
  answerType: Extract<AnswerType, "single" | "multi">;
  hideSubmitButton?: boolean;
};

export default function BaseOptionGrid({
  options,
  onSubmit,
  isHost,
  answerType,
  hideSubmitButton,
}: BaseOptionGridProps) {
  const numOptions = options.length;
  if (numOptions < 2) {
    return <SomethingWentWrong optionalText="Must have at least 2 options!" />;
  }

  const [optionsSelected, setOptionsSelected] = useState<string[]>([]);

  return (
    <Stack spacing={1.5} className={styles.baseOptionGridContainer}>
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
        {options.map((opt, i) => (
          <BaseOption
            key={i}
            text={opt}
            color={OPTION_COLORS[i]}
            singleSelect={answerType === "single"}
            isCenterButton={false}
            onClick={(toggled: boolean) => {
              if (answerType === "single") {
                onSubmit(opt);
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
        ))}
      </Box>
      {!hideSubmitButton && !isHost && answerType === "multi" && (
        <Button
          variant="primary"
          onClick={() => onSubmit(optionsSelected)}
          sx={{ width: "90%", alignSelf: "center" }}
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
  isCenterButton: boolean;
};

function BaseOption({
  onClick,
  text,
  color,
  singleSelect,
  isCenterButton,
}: BaseOptionProps) {
  const [selected, setSelected] = useState<boolean>(false);

  const {
    background,
    toggledBg,
    color: textColor,
    toggledColor,
    hoverBg,
  } = OPTION_COLOR_MAP[color];
  const toggled = !singleSelect && selected;

  return (
    <Button
      onClick={() => {
        onClick(!selected);
        setSelected(!selected);
      }}
      className={isCenterButton ? styles.centerBaseOption : ""}
      sx={{
        backgroundColor: background,
        color: toggled ? toggledColor : textColor,
        borderRadius: toggled ? "4px" : "6px",
        fontWeight: 600,
        transition: "all 0.15s ease-out",
        "&:hover": {
          backgroundColor: background,
        },
        "&:active": {
          backgroundColor: toggledBg,
        },
        ...(toggled && {
          outline: `2px solid ${toggledBg}`,
          outlineOffset: "6px",
          boxShadow: `0 0 10px ${toggledBg}`,
        }),
        flexShrink: 0,
      }}
    >
      {text}
    </Button>
  );
}
