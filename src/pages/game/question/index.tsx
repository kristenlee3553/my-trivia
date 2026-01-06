import { Box, Typography } from "@mui/material";
import type { QuestionRuntime } from "../../../common/types";
import styles from "./index.module.css";
import ThemeWrapper from "../../../common/theme";
import type { QuestionAuthor } from "../../../common/types";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import VideoDisplay from "../VideoDisplay";

type QuestionPageProps = {
  isHost: boolean;
  question: QuestionRuntime;
  questionNumber: number;
  totalQuestions: number;
  onQuestionComplete: () => void;
};

export default function QuestionPage({
  isHost,
  question,
  questionNumber,
  totalQuestions,
  onQuestionComplete,
}: QuestionPageProps) {
  return isHost ? (
    <QuestionComponent
      question={question}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onComplete={onQuestionComplete}
    />
  ) : (
    <Box className={styles.playerQuestionContainer}>
      <Typography variant="h1">Look up at the host screen!</Typography>
      <Typography>
        Perhaps in the future, there will be cool UI here...
      </Typography>
    </Box>
  );
}

type QuestionComponentProps = {
  question: QuestionAuthor;
  onComplete: () => void;
  questionNumber?: number;
  totalQuestions?: number;
};

type QuestionPhase =
  | "doublePoints"
  | "questionType"
  | "question"
  | "initial"
  | "video";

function QuestionComponent({
  question,
  onComplete,
  questionNumber,
  totalQuestions,
}: QuestionComponentProps) {
  const [phase, setPhase] = useState<QuestionPhase>("initial");
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Decide what to show
    if (phase === "initial") {
      const newPhase: QuestionPhase = question.doublePoints
        ? "doublePoints"
        : "questionType";
      setPhase(newPhase);
    }
    if (phase === "doublePoints") {
      const t = setTimeout(() => setPhase("questionType"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "questionType") {
      const t = setTimeout(() => setPhase("question"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "question") {
      let timeLimit = calcReadingTime(question);

      // Add video time to progress bar
      if (question.displayType === "video") {
        const newStartTime = question.startTime ?? 0;
        const newEndTime = question.endTime ?? 30;
        timeLimit += newEndTime - newStartTime + 1;
      }

      const start = Date.now();
      const interval = setInterval(() => {
        setProgress(Math.min((Date.now() - start) / (timeLimit * 1000), 1));
      }, 100);

      // If video and no prompt text, skip to video phase. Can clean this up
      if (question.displayType === "video") {
        if (!question.promptText) {
          setPhase("video");
        } else {
          setTimeout(() => setPhase("video"), timeLimit);
        }
      }
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <ThemeWrapper>
      <Box className={styles.questionPageContainer}>
        <Typography
          className={styles.questionNumber}
        >{`Q${questionNumber ?? 0} of ${totalQuestions ?? 0}`}</Typography>
        <AnimatePresence mode="wait">
          {phase === "doublePoints" && (
            <DoublePointsAnimation key="doublePoints" />
          )}

          {phase === "questionType" && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl font-semibold text-blue-400"
            >
              {question.answerType} Question
            </motion.div>
          )}

          {phase === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: [1.1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl font-bold max-w-4xl leading-snug"
            >
              {question.promptText}
              {question.displayType === "image" && (
                <motion.img
                  src={question.imageUrl}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    marginTop: 20,
                    maxWidth: "60vw",
                    maxHeight: "45vh",
                    objectFit: "contain",
                    borderRadius: 12,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  }}
                />
              )}
            </motion.div>
          )}
          {phase === "video" && question.displayType === "video" && (
            <motion.div
              key="video"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-[640px] h-[360px] mx-auto rounded-xl overflow-hidden shadow-lg"
            >
              <VideoDisplay
                videoUrl={question.videoUrl}
                startTime={question.startTime ?? 0}
                endTime={question.endTime ?? 0}
                className="w-full h-full"
                onVideoEnd={onComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {phase === "question" ||
          (phase === "video" && (
            <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 h-2 w-3/4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-400"
                animate={{ width: `${progress * 100}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </motion.div>
          ))}
      </Box>
    </ThemeWrapper>
  );
}

// Reusable animation for double points
function DoublePointsAnimation() {
  return (
    <motion.div
      key="doublePoints"
      className="flex flex-col items-center justify-center absolute inset-0"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: [0.6, 1.2, 1] }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 1.8, ease: "easeInOut" }}
    >
      <motion.div
        className="w-32 h-32 rounded-full border-8 border-yellow-400 flex items-center justify-center text-5xl font-bold text-yellow-300"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        ×2
      </motion.div>
      <motion.div
        className="mt-4 text-4xl font-extrabold text-yellow-300 drop-shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      >
        DOUBLE POINTS!
      </motion.div>
    </motion.div>
  );
}

function calcReadingTime(question: QuestionAuthor): number {
  if (!question.promptText) return 0;
  const words = question.promptText.trim().split(/\s+/).length;
  const textTime = Math.min(2.5 + words * 0.35, 12);
  const extraTime = question.displayType === "image" ? 3 : 0;
  return extraTime + textTime; // seconds
}
