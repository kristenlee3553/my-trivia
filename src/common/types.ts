import { z } from "zod";
export type LobbyStatus =
  | "notStarted"
  | "question"
  | "answering"
  | "showAnswer"
  | "leaderboard"
  | "finalScore"
  | "completed";

export const PlayerSchema = z.object({
  uid: z.string(),
  nickname: z.string(),
  joinDate: z.string(), // ISO string
  score: z.number(),
  streak: z.number(),
  numCorrect: z.number(),
  numAnswered: z.number(),
});

export type DisplayType = "video" | "text" | "image";

type EnsureValidDisplayType<T extends DisplayType> = T;

export type DisplayText = {
  displayType: EnsureValidDisplayType<"text">;
  promptText: string;
};

export type DisplayVideo = {
  displayType: EnsureValidDisplayType<"video">;
  videoUrl: string;
  startTime?: number;
  endTime?: number;
  loop?: boolean;
  promptText?: string;
};

export type DisplayImage = {
  displayType: EnsureValidDisplayType<"image">;
  imageUrl: string;
  promptText?: string;
};

export type Display = DisplayText | DisplayVideo | DisplayImage;

export type QuestionType =
  | "single"
  | "multi"
  | "matching"
  | "ranking"
  | "draw"
  | "shortAnswer";

type EnsureValidQuestionType<T extends QuestionType> = T;

export type SingleSelect = {
  answerType: EnsureValidQuestionType<"single">;
  options: string[];
  correctAnswer: string;
  playerAnswers: Record<string, string>;
};

export type MultiSelect = {
  answerType: EnsureValidQuestionType<"multi">;
  options: string[];
  correctAnswer: string[];
  playerAnswers: Record<string, string[]>;
};

export type Matching = {
  answerType: EnsureValidQuestionType<"matching">;
  options: {
    left: Set<string>;
    right: Set<string>;
  };
  correctAnswer: Record<string, string>;
  playerAnswers: Record<string, Record<string, string>>;
};

export type Ranking = {
  answerType: EnsureValidQuestionType<"ranking">;
  options: string[];
  leftLabel: string;
  rightLabel: string;
  correctAnswer: string[];
  playerAnswers: Record<string, string[]>;
};

export type Drawing = {
  answerType: EnsureValidQuestionType<"draw">;
  options: never;
  correctAnswer: string;
  playerAnswers: Record<string, string>; // dataurl
};

export type ShortAnswer = {
  answerType: EnsureValidQuestionType<"shortAnswer">;
  options: never;
  correctAnswer: string;
  playerAnswers: Record<string, string>;
};

type QuestionTypeData =
  | SingleSelect
  | MultiSelect
  | Matching
  | Ranking
  | Drawing
  | ShortAnswer;

type BaseQuestion = {
  timeLimit?: number;
  doublePoints?: boolean;
  correctAnswerDisplay?: Display;
};

type MergeAuthor<T> = T extends any
  ? Omit<T, "playerAnswers"> & BaseQuestion & Display
  : never;

// This creates a clean Union where 'answerType' is the clear boss
export type QuestionAuthor = MergeAuthor<QuestionTypeData>;

type DistributeRuntime<T> = T extends any
  ? T & BaseQuestion & Display & { id: string }
  : never;

export type QuestionRuntime = DistributeRuntime<QuestionTypeData>;

type BaseGame = {
  name: string;
  defaultTimeLimit?: number;
};

export type GameAuthor = BaseGame & {
  questions: QuestionAuthor[];
};

export type GameRuntime = BaseGame & {
  questions: QuestionRuntime[];
};

export type Lobby = {
  lobbyCode: string;
  hostId: string;
  players: Record<string, Player>;
  lobbyStatus: LobbyStatus;
  startTime: string;
  lastUpdated: string;
  gameData: GameRuntime;
  currentQuestion: string;
  questionOrder: string[];
  currentIndex: number;
  gameOptions: {
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
  };
};

export type Player = z.infer<typeof PlayerSchema>;
