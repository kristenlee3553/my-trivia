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

// Player schema
export const PlayerSchema = z.object({
  uid: z.string(),
  nickname: z.string(),
  joinDate: z.string(), // ISO string
  score: z.number(),
  streak: z.number(),
});

// Just Text
const DisplayText = z.object({
  type: z.literal("text"),
  promptText: z.string(),
});

// Video + optional text
const DisplayVideo = z.object({
  type: z.literal("video"),
  videoUrl: z.url(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  loop: z.boolean().optional(),
  promptText: z.string().optional(),
});

export const DisplaySchema = z.discriminatedUnion("type", [
  DisplayText,
  DisplayVideo,
]);

const SingleSelect = z.object({
  answerType: z.literal("single"),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  answers: z.record(z.string(), z.string()), // player id -> answer
});

const MultiSelect = z.object({
  answerType: z.literal("multi"),
  options: z.array(z.string()).min(2),
  correctAnswer: z.array(z.string()),
  answers: z.record(z.string(), z.array(z.string())), // { playerId: ["option1","option2"] }
});

const Matching = z.object({
  answerType: z.literal("matching"),
  options: z.record(z.string(), z.string()), // { "A": "Cat", "B": "Dog" }
  correctAnswer: z.record(z.string(), z.string()), // { "A": "Meow", "B": "Woof" }
  answers: z.record(z.string(), z.record(z.string(), z.string())), // { playerId: { "A": "Meow" } }
});

export const AnswerSchema = z.discriminatedUnion("answerType", [
  SingleSelect,
  MultiSelect,
  Matching,
]);

// Question schema
export const QuestionSchema = z
  .object({
    id: z.uuid().optional(),
  })
  .and(DisplaySchema)
  .and(AnswerSchema);

// Game options schema
export const GameOptionsSchema = z.object({
  shuffleQuestions: z.boolean(),
  shuffleAnswers: z.boolean(),
  pickXQuestion: z.number().optional(),
});

export const GameSchema = z.object({
  name: z.string(),
  defaultAnswer: AnswerSchema.optional(),
  questions: z.array(QuestionSchema).min(1),
});

// Lobby schema
export const LobbySchema = z.object({
  lobbyCode: z.string(),
  hostId: z.string(),
  players: z.record(z.string(), PlayerSchema),
  startTime: z.string(), // ISO string
  lobbyStatus: LobbyStatusSchema,
  gameInfo: GameSchema,
  currentQuestion: z.uuid(), // points to the id of the question
  questionOrder: z.array(z.uuid()), // defines play order
  currentIndex: z.number().min(0), // which index we’re at in the order
  gameOptions: GameOptionsSchema,
});

// Infer TypeScript types automatically
export type Player = z.infer<typeof PlayerSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type LobbyStatus = z.infer<typeof LobbyStatusSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Lobby = z.infer<typeof LobbySchema>;
export type Game = z.infer<typeof GameSchema>;
export type GameOptions = z.infer<typeof GameOptionsSchema>;
