import { useState } from "react";
import BaseTextField from "../../../common/components/Textfield";
import type { ShortAnswer } from "../../../common/types";
import styles from "./index.module.css";
import { Button, Typography } from "@mui/material";

type ShortAnswerProps = {
  promptText?: string;
  onSubmit?: (answer: ShortAnswer["correctAnswer"]) => void;
};

const MAX_LENGTH = 255;

export default function ShortAnswer({
  onSubmit,
  promptText,
}: ShortAnswerProps) {
  const [answer, setAnswer] = useState<string>("");
  return (
    <div className={styles.shortAnswerContainer}>
      {onSubmit && (
        <>
          <BaseTextField
            labelText={promptText ?? "Enter Answer: "}
            onChange={(value) => setAnswer(value)}
            slotProps={{
              textField: {
                multiline: true,
                maxRows: 10,
                fullWidth: true,
                slotProps: { htmlInput: { maxLength: MAX_LENGTH } },
                helperText: `${answer.length} / ${MAX_LENGTH}`,
              },
            }}
          />
          <Button
            onClick={() => onSubmit(answer)}
            disabled={answer.length === 0}
            variant="secondary"
          >
            Lock In
          </Button>
        </>
      )}
      {!onSubmit && (
        <Typography className={styles.hostPlaceholder}>
          Perhaps there will be nice UI here in the future...
        </Typography>
      )}
    </div>
  );
}
