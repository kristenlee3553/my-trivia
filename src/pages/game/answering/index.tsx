import { Button, Stack, Typography } from "@mui/material";
import type {
  DisplayImage,
  DisplayVideo,
  Matching,
  QuestionRuntime,
} from "../../../common/types";
import BaseOptionGrid from "../options/BaseOption";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import VideoDisplay from "../VideoDisplay";
import MatchingOption from "../options/MatchingOption";
import RankingOptionPlayer, {
  RankingOptionHost,
} from "../options/RankingOption";
import ShortAnswer from "../options/ShortAnswer";
import DrawOptionPlayer, { DrawOptionHost } from "../options/DrawOption";

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
  numPlayers: number;
};

function AnsweringFooter({
  lobbyCode,
  numAnswered,
  numPlayers,
}: AnsweringFooterProps) {
  return (
    <div className={styles.hostFooter}>
      <Typography>
        Players Answered: {numAnswered}/{numPlayers}
      </Typography>
      <Typography>Lobby Code: {lobbyCode}</Typography>
    </div>
  );
}

type MediaDisplayContainerProps = {
  videoProps?: Pick<
    DisplayVideo,
    "videoUrl" | "startTime" | "endTime" | "loop"
  >;
  imageProps?: Pick<DisplayImage, "imageUrl">;
};

function MediaDisplayContainer({
  videoProps,
  imageProps,
}: MediaDisplayContainerProps) {
  return (
    <div className={styles.mediaContainer}>
      {videoProps && (
        <VideoDisplay
          videoUrl={videoProps.videoUrl}
          startTime={videoProps.startTime}
          endTime={videoProps.endTime}
          loopVideo={videoProps.loop}
          className={styles.videoDisplay}
        />
      )}
      {imageProps && <img src={imageProps.imageUrl} />}
    </div>
  );
}

type PlayerAnswerPageProps<T extends QuestionRuntime> = {
  question: T;
  playerId: string;
};

export function PlayerAnswerPage<T extends QuestionRuntime>({
  question,
  playerId,
}: PlayerAnswerPageProps<T>) {
  const { answerType, options } = question;

  const handlePlayerSubmit = (answer: T["correctAnswer"]) => {
    console.log(`Submitting for ${playerId}:`, answer);
    const { answerType, correctAnswer } = question;
    let isCorrect = false;

    switch (answerType) {
      case "single":
        isCorrect = answer === correctAnswer;
        break;
      case "multi":
        (answer as string[]).length === correctAnswer.length;
        break;
      case "ranking":
        isCorrect =
          (answer as string[]).length === correctAnswer.length &&
          (answer as string[]).every(
            (val, index) => val === correctAnswer[index]
          );
        break;
      case "matching":
        const playerAns = answer as Matching["correctAnswer"];
        const keys = Object.keys(correctAnswer);

        isCorrect = keys.every((key) => playerAns[key] === correctAnswer[key]);
        break;
      case "draw":
      case "shortAnswer":
        break;
    }

    console.log(isCorrect ? "✨ Correct!" : "❌ Try again!");
  };

  let content = null;

  switch (answerType) {
    case "single":
    case "multi": {
      content = (
        <BaseOptionGrid
          answerType={answerType}
          options={options}
          onSubmit={handlePlayerSubmit}
        />
      );
      break;
    }
    case "matching": {
      content = (
        <MatchingOption options={options} onSubmit={handlePlayerSubmit} />
      );
      break;
    }
    case "ranking": {
      content = (
        <RankingOptionPlayer
          options={options}
          leftLabel={question.leftLabel}
          rightLabel={question.rightLabel}
          onSubmit={handlePlayerSubmit}
        />
      );
      break;
    }
    case "shortAnswer": {
      content = (
        <ShortAnswer
          promptText={question.promptText}
          onSubmit={handlePlayerSubmit}
        />
      );
      break;
    }
    case "draw": {
      content = (
        <DrawOptionPlayer
          promptText={question.promptText}
          onSubmit={handlePlayerSubmit}
        />
      );
      break;
    }
    default: {
      console.warn("NOT IMPLEMENTED");
    }
  }

  return <div className={styles.playerContainer}>{content}</div>;
}

type HostAnswerPageProps = {
  question: QuestionRuntime;
  onNextPhase: () => void;
  questionNumber: AnsweringPageTopProps["questionNumber"];
  lobbyCode: AnsweringFooterProps["lobbyCode"];
};

export function HostAnswerPage({
  lobbyCode,
  onNextPhase,
  question,
  questionNumber,
}: HostAnswerPageProps) {
  const { answerType, options, displayType } = question;

  const numAnswered = 2; // TO DO SYNC WITH DB
  const numPlayers = 5;
  return (
    <div className={styles.hostContainer}>
      <AnsweringPageTop
        onQuestionSubmit={onNextPhase}
        question={question}
        questionNumber={questionNumber}
      />
      {displayType === "video" && (
        <MediaDisplayContainer
          videoProps={{
            videoUrl: question.videoUrl,
            endTime: question.endTime,
            loop: question.loop,
            startTime: question.startTime,
          }}
        />
      )}
      {displayType === "image" && (
        <MediaDisplayContainer imageProps={{ imageUrl: question.imageUrl }} />
      )}
      {(answerType === "single" || answerType === "multi") && (
        <BaseOptionGrid answerType={answerType} options={options} />
      )}
      {answerType === "matching" && <MatchingOption options={options} />}
      {answerType === "ranking" && (
        <RankingOptionHost
          options={options}
          leftLabel={question.leftLabel}
          rightLabel={question.rightLabel}
        />
      )}
      {answerType === "shortAnswer" && (
        <ShortAnswer promptText={question.promptText} />
      )}
      {answerType === "draw" && <DrawOptionHost />}
      <AnsweringFooter
        lobbyCode={lobbyCode}
        numAnswered={numAnswered}
        numPlayers={numPlayers}
      />
    </div>
  );
}
