import { Button, Stack, Typography } from "@mui/material";
import type {
  DisplayImage,
  DisplayVideo,
  Player,
  PlayerAnswer,
  QuestionRuntime,
} from "../../../common/types";
import BaseOptionGrid from "../options/BaseOption";
import styles from "./index.module.css";
import { useEffect, useRef, useState } from "react";
import VideoDisplay from "../VideoDisplay";
import MatchingOption from "../options/MatchingOption";
import RankingOptionPlayer, {
  RankingOptionHost,
} from "../options/RankingOption";
import ShortAnswer from "../options/ShortAnswer";
import DrawOptionPlayer, { DrawOptionHost } from "../options/DrawOption";
import {
  calculatePoints,
  getAnswerAccuracy,
  isSubjectiveQuestionType,
} from "../../logic";

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

export function MediaDisplayContainer({
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
  player: Player;
};

export function PlayerAnswerPage<T extends QuestionRuntime>({
  question,
  player,
}: PlayerAnswerPageProps<T>) {
  const { answerType, options, doublePoints, timeLimit } = question;
  const startTime = useRef(Date.now());

  const handlePlayerSubmit = (answer: T["correctAnswer"]) => {
    const now = Date.now();
    const timeTakenMs = now - startTime.current;
    const isCorrect = getAnswerAccuracy({ player, question });

    const playerAnswerData: PlayerAnswer<T["correctAnswer"]> = {
      answer: answer,
      accuracy: isCorrect,
      scoreEarned: calculatePoints({
        accuracy: isCorrect,
        isDoublePoints: doublePoints ?? false,
        questionTimeLimit: timeLimit,
        timeTakenMs,
        streak: player.streak,
        ignoreTimePoints: isSubjectiveQuestionType(answerType),
      }),
      timeTaken: timeTakenMs,
      streakAtStart: player.streak,
    };

    // TO DO UPDATE DB PlayerAnswer record
    console.log("Player answer: ", playerAnswerData);
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
