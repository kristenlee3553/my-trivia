import { OPTION_COLORS, OPTION_COLOR_MAP } from "../common/theme";
import type {
  Lobby,
  Matching,
  MultiSelect,
  Player,
  QuestionRuntime,
  QuestionType,
  Ranking,
  SingleSelect,
} from "../common/types";

export function getBasePoints(isDoublePoints: boolean) {
  return isDoublePoints ? 2000 : 1000;
}

export function calculatePoints({
  accuracy,
  isDoublePoints,
  streak,
  timeTakenMs,
  questionTimeLimit,
  ignoreTimePoints = false,
  customBasePoints,
}: {
  timeTakenMs: number;
  accuracy: number;
  isDoublePoints: boolean;
  streak: number;
  questionTimeLimit: number;
  ignoreTimePoints?: boolean;
  customBasePoints?: number;
}): number {
  if (accuracy === 0) return 0;
  const basePoints = customBasePoints ?? getBasePoints(isDoublePoints);
  const timeTakenSec = timeTakenMs / 1000;

  const decayFactor = 0.5;
  const timeRatio = timeTakenSec / questionTimeLimit;

  const earnedBase = basePoints * accuracy;

  const scoreWithTimePenalty = (1 - timeRatio * decayFactor) * earnedBase;

  const streakMultiplier = 1 + streak * 0.05;

  const finalScore = ignoreTimePoints
    ? earnedBase * streakMultiplier
    : scoreWithTimePenalty * streakMultiplier;

  return Math.round(finalScore);
}

export function calculateAccuracy<T extends QuestionRuntime>(
  question: T,
  playerAnswer: T["correctAnswer"]
): number {
  switch (question.answerType) {
    case "single": {
      const pAnswer = playerAnswer as SingleSelect["correctAnswer"];
      return pAnswer.trim().toLowerCase() ===
        question.correctAnswer.toLowerCase()
        ? 1
        : 0;
    }
    case "multi": {
      const pAnswer = playerAnswer as MultiSelect["correctAnswer"];
      const correct = question.correctAnswer;
      const correctGuesses = pAnswer.filter((val) =>
        correct.includes(val)
      ).length;
      const wrongGuesses = pAnswer.filter(
        (val) => !correct.includes(val)
      ).length;
      // Penalty logic: correct minus wrong, divided by total correct
      const score = (correctGuesses - wrongGuesses) / correct.length;
      console.log(
        `${correctGuesses} - ${wrongGuesses} / ${correct.length} = ${score}`
      );
      return Math.max(0, score);
    }
    case "matching": {
      const pAnswer = playerAnswer as Matching["correctAnswer"];
      const correct = question.correctAnswer;
      const keys = Object.keys(correct);
      const matches = keys.filter((k) => pAnswer[k] === correct[k]).length;
      return matches / keys.length;
    }

    case "ranking": {
      const pAnswer = playerAnswer as Ranking["correctAnswer"];
      const correct = question.correctAnswer;
      const correctPositions = pAnswer.filter(
        (val, i) => val === correct[i]
      ).length;
      return correctPositions / correct.length;
    }
    case "draw":
    case "shortAnswer":
      return 1; // Host will update the isCorrect flag
    default:
      return 0;
  }
}

export function getAnswerAccuracy({
  player,
  question,
}: {
  question: QuestionRuntime;
  player: Player;
}): number {
  const pId = player.uid;

  // 1. Check if the answer even exists first
  if (!question.playerAnswers || !question.playerAnswers[pId]) {
    return 0;
  }
  const pAnswer = question.playerAnswers[pId].answer;

  return calculateAccuracy(question, pAnswer);
}

export function isSubjectiveQuestionType(question: QuestionType): boolean {
  return question === "draw" || question === "shortAnswer";
}

export const getEntries = <T extends object>(obj: T) => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

// THRESHOLD CALCULATED HERE
export function isQuestionCorrect(accuracy: number) {
  return accuracy >= 0.5;
}

export function getColorConfig(i: number) {
  const colorKey = OPTION_COLORS[i % OPTION_COLORS.length];
  return OPTION_COLOR_MAP[colorKey];
}

export function getUpdatedPlayer(
  question: QuestionRuntime,
  player: Player,
  isTest?: boolean
): Player {
  const { playerAnswers } = question;
  const { uid, score, streak } = player;

  const playerAnswer = playerAnswers[isTest ? 1001 : uid];
  const questionCorrect =
    playerAnswer && isQuestionCorrect(playerAnswer.accuracy);

  const newScore = playerAnswer ? score + playerAnswer.scoreEarned : score;
  const newStreak = questionCorrect ? streak + 1 : 0;
  const numAnswered = playerAnswer
    ? player.numAnswered + 1
    : player.numAnswered;
  const numCorrect = questionCorrect
    ? player.numCorrect + 1
    : player.numCorrect;

  return {
    ...player,
    numAnswered,
    score: newScore,
    streak: newStreak,
    numCorrect,
  };
}

export function getSortedPlayersByScore(
  players: Lobby["players"],
  order: "asc" | "desc"
): Player[] {
  if (order === "asc") {
    return Object.values(players).sort((a, b) => a.score - b.score);
  }

  return Object.values(players).sort((a, b) => b.score - a.score);
}
