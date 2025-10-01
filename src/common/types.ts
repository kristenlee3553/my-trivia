import { z } from "zod";

// Enums
export const LobbyStatusSchema = z.enum(["notStarted", "started", "completed"]);
export const QuestionTypeSchema = z.enum(["video", "text"]);

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
  type: QuestionTypeSchema,
  options: z.array(z.string()),
  correctAnswer: z.string(),
  answers: z.record(z.string(), z.string()), // uid -> answer
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
});

// Infer TypeScript types automatically
export type Player = z.infer<typeof PlayerSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type LobbyStatus = z.infer<typeof LobbyStatusSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type Lobby = z.infer<typeof LobbySchema>;
export type GameOptions = z.infer<typeof GameOptionsSchema>;
