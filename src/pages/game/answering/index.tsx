import { Button, Stack, Typography } from "@mui/material";
import type { QuestionRuntime } from "../../../common/types";
import BaseOptionGrid from "../options/BaseOption";
import styles from "./index.module.css";
import { useEffect, useState } from "react";

type AnsweringPageTopProps = {
  question: QuestionRuntime;
  onQuestionSubmit: () => void;
  questionNumber: number;
};

function AnsweringPageTop({
  question,
  onQuestionSubmit,
  questionNumber,
}: AnsweringPageTopProps) {
  const { promptText } = question;
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimit ?? 30);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onQuestionSubmit();
    }
  }, [timeLeft]);

  return (
    <div className={styles.topQuestionRow}>
      <div className={styles.questionNumber}>
        <Typography>Q{questionNumber}</Typography>
      </div>
      {promptText && (
        <Typography className={styles.question}>{promptText}</Typography>
      )}
      <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
        <div className={styles.timerContainer}>
          <Typography>{30}</Typography>
        </div>
        <Button
          onClick={onQuestionSubmit}
          variant="primary"
          className={styles.nextButton}
        >
          Next
        </Button>
      </Stack>
    </div>
  );
}

type AnsweringFooterProps = {
  lobbyCode: string;
  numAnswered: number;
};

function AnsweringFooter({ lobbyCode, numAnswered }: AnsweringFooterProps) {
  return (
    <div className={styles.hostFooter}>
      <Typography>Number Players Answered: {numAnswered}</Typography>
      <Typography>Lobby Code: {lobbyCode}</Typography>
    </div>
  );
}

type AnsweringPageProps = {
  isHost: boolean;
  question: QuestionRuntime;
  onQuestionSubmit: () => void;
  questionNumber: AnsweringPageTopProps["questionNumber"];
  lobbyCode: AnsweringFooterProps["lobbyCode"];
};
export default function AnsweringPage({
  isHost,
  onQuestionSubmit,
  question,
  lobbyCode,
  questionNumber,
}: AnsweringPageProps) {
  const { answerType, options } = question;

  const numAnswered = 2; // TO DO SYNC WITH DB
  return isHost ? (
    <div className={styles.hostContainer}>
      <AnsweringPageTop
        onQuestionSubmit={onQuestionSubmit}
        question={question}
        questionNumber={questionNumber}
      />
      {(answerType === "single" || answerType === "multi") && (
        <BaseOptionGrid answerType={answerType} options={options} />
      )}
      <AnsweringFooter lobbyCode={lobbyCode} numAnswered={numAnswered} />
    </div>
  ) : (
    <div className={styles.playerContainer}>
      {(answerType === "single" || answerType === "multi") && (
        <BaseOptionGrid
          answerType={answerType}
          options={options}
          onSubmit={() => {}}
        />
      )}
    </div>
  );
}
