import { z } from "zod";

// Enums
export const LobbyStatusSchema = z.enum([
  "notStarted",
  "preview",
  "answering",
  "showAnswer",
  "leaderboard",
  "finalScore",
  "completed",
]);
export const QuestionTypeSchema = z.enum(["video", "text"]);

export const AnswerTypeSchema = z.enum(["selectOne", "multiCheck"]);

// Player schema
export const PlayerSchema = z.object({
  uid: z.string(),
  nickname: z.string(),
  joinDate: z.string(), // ISO string
  score: z.number(),
  streak: z.number(),
});

// Question schema
export const QuestionSchema = z.object({
  id: z.string(),
  questionType: QuestionTypeSchema,
  answerType: AnswerTypeSchema,
  options: z.array(z.string()),
  correctAnswer: z.array(z.string()), // If multi select
  answers: z.record(z.string(), z.array(z.string())), // uid -> answer(s)
});

// Lobby schema
export const LobbySchema = z.object({
  lobbyCode: z.string(),
  hostId: z.string(),
  players: z.record(z.string(), PlayerSchema),
  startTime: z.string(), // ISO string
  lobbyStatus: LobbyStatusSchema,
  questions: z.record(z.string(), QuestionSchema),
  currentQuestion: z.string(),
});

// Game options schema
export const GameOptionsSchema = z.object({
  shuffleQuestions: z.boolean(),
  shuffleAnswers: z.boolean(),
  pickXQuestion: z.number(),
});

// Infer TypeScript types automatically
export type Player = z.infer<typeof PlayerSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type LobbyStatus = z.infer<typeof LobbyStatusSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type AnswerType = z.infer<typeof AnswerTypeSchema>;
export type Lobby = z.infer<typeof LobbySchema>;
export type GameOptions = z.infer<typeof GameOptionsSchema>;
