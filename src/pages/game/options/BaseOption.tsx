import { Box, Button, Stack } from "@mui/material";
import SomethingWentWrong from "../../error/SomethingWentWrong";
import {
  OPTION_COLOR_MAP,
  OPTION_COLORS,
  type OPTION_COLORS_KEYS,
} from "../../../common/theme";
import { useState } from "react";
import styles from "./BaseOption.module.css";
import type { QuestionType } from "../../../common/types";

type BaseOptionGridProps = {
  /**Pass options in the order you want displayed */
  options: string[];
  onSubmit?: (answer: string | string[]) => void;
  answerType: Extract<QuestionType, "single" | "multi">;
  hideSubmitButton?: boolean;
};

export default function BaseOptionGrid({
  options,
  onSubmit,
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
        {options.map((opt, i) =>
          onSubmit ? (
            <BaseOption
              key={i}
              text={opt}
              color={OPTION_COLORS[i]}
              singleSelect={answerType === "single"}
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
          ) : (
            <HostBaseOption text={opt} color={OPTION_COLORS[i]} key={i} />
          )
        )}
      </Box>
      {!hideSubmitButton && answerType === "multi" && onSubmit && (
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
};

function BaseOption({ onClick, text, color, singleSelect }: BaseOptionProps) {
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
      className={styles.baseOption}
      sx={{
        backgroundColor: background,
        color: toggled ? toggledColor : textColor,
        borderRadius: toggled ? "4px" : "6px",
        transition: "all 0.15s ease-out",
        "&:hover": {
          backgroundColor: hoverBg,
        },
        "&:active": {
          backgroundColor: toggledBg,
        },
        ...(toggled && {
          outline: `2px solid ${toggledBg}`,
          outlineOffset: "6px",
          boxShadow: `0 0 10px ${toggledBg}`,
        }),
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
  const { background, color: textColor } = OPTION_COLOR_MAP[color];
  return (
    <div
      className={styles.baseOption}
      style={{
        backgroundColor: background,
        color: textColor,
      }}
    >
      {text}
    </div>
  );
}
