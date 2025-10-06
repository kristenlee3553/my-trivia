import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

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

export const AnswerType = z.enum(["single", "multi", "matching", "ranking"]);
export const DisplayType = z.enum(["video", "text", "image"]);

// Player schema
export const PlayerSchema = z.object({
  uid: z.string(),
  nickname: z.string(),
  joinDate: z.string(), // ISO string
  score: z.number(),
  streak: z.number(),
  numCorrect: z.number(),
  numAnswered: z.number(),
});

// Just Text
const DisplayText = z.object({
  type: z.literal(DisplayType.enum.text),
  promptText: z.string(),
});

// Video + optional text
const DisplayVideo = z.object({
  type: z.literal(DisplayType.enum.video),
  videoUrl: z.url(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  loop: z.boolean().optional(),
  promptText: z.string().optional(),
});

const DisplayImage = z.object({
  type: z.literal(DisplayType.enum.image),
  imageUrl: z.url(),
  promptText: z.string().optional(),
});

export const DisplaySchema = z.discriminatedUnion("type", [
  DisplayText,
  DisplayVideo,
  DisplayImage,
]);

const OptionsSchema = z.discriminatedUnion("answerType", [
  z.object({
    answerType: z.literal(AnswerType.enum.single),
    options: z.array(z.string()).min(2),
  }),
  z.object({
    answerType: z.literal(AnswerType.enum.multi),
    options: z.array(z.string()).min(2),
  }),
  z.object({
    answerType: z.literal(AnswerType.enum.matching),
    options: z.object({
      left: z.set(z.string()),
      right: z.set(z.string()),
    }),
  }),
  z.object({
    answerType: z.literal(AnswerType.enum.ranking),
    options: z.array(z.string()),
    leftLabel: z.string(),
    rightLabel: z.string(),
  }),
]);

const SingleSelectCorrectAnswer = z.object({
  answerType: z.literal(AnswerType.enum.single),
  correctAnswer: z.string(),
});

const MultiSelectCorrectAnswer = z.object({
  answerType: z.literal(AnswerType.enum.multi),
  correctAnswer: z.array(z.string()),
});

const MatchingCorrectAnswer = z.object({
  answerType: z.literal(AnswerType.enum.matching),
  correctAnswer: z.record(z.string(), z.string()), // { "A": "Meow", "B": "Woof" }
});

const RankingCorrectAnswer = z.object({
  answerType: z.literal(AnswerType.enum.ranking),
  correctAnswer: z.array(z.string()),
});

export const CorrectAnswerSchema = z.discriminatedUnion("answerType", [
  SingleSelectCorrectAnswer,
  MultiSelectCorrectAnswer,
  MatchingCorrectAnswer,
  RankingCorrectAnswer,
]);

const QuestionAuthorSchema = z
  .object({
    timeLimit: z.number().optional(),
    options: OptionsSchema.optional(),
    correctAnswer: CorrectAnswerSchema,
    doublePoints: z.boolean().optional(),
  })
  .and(DisplaySchema);

const SingleSelectRuntime = z.object({
  answerType: z.literal(AnswerType.enum.single),
  answers: z.record(z.string(), z.string()), // playerId -> answer
});

const MultiSelectRuntime = z.object({
  answerType: z.literal(AnswerType.enum.multi),
  answers: z.record(z.string(), z.array(z.string())),
});

const MatchingRuntime = z.object({
  answerType: z.literal(AnswerType.enum.matching),
  answers: z.record(z.string(), z.record(z.string(), z.string())),
});

const RankingRuntime = z.object({
  answerType: z.literal(AnswerType.enum.ranking),
  answers: z.record(z.string(), z.array(z.string())),
});

export const AnswerRuntimeSchema = z.discriminatedUnion("answerType", [
  SingleSelectRuntime,
  MultiSelectRuntime,
  MatchingRuntime,
  RankingRuntime,
]);

export const QuestionRuntimeSchema = QuestionAuthorSchema.and(
  z
    .object({
      id: z.uuid().default(() => uuidv4()),
      answers: AnswerRuntimeSchema,
    })
    .superRefine((q, ctx) => {
      const question = q as typeof q & {
        options?: z.infer<typeof OptionsSchema>;
      };
      // Ensure answer type matches in options and answers
      if (
        question.answers &&
        question.options &&
        question.answers.answerType != question.options?.answerType
      ) {
        ctx.addIssue({
          path: ["answers"],
          code: "custom",
          message: `answerType mismatch: expected "${question.answers.answerType}" but got "${question.options.answerType}"`,
        });
      }
    })
);

// Game options schema
export const GameOptionsSchema = z.object({
  shuffleQuestions: z.boolean(),
  shuffleAnswers: z.boolean(),
  pickXQuestion: z.number().optional(),
});

// Game schema
const GameAuthorSchema = z
  .object({
    name: z.string(),
    defaultOptions: OptionsSchema.optional(),
    defaultTimeLimit: z.number().optional(),
    questions: z.array(QuestionAuthorSchema).min(1),
  })
  .superRefine((game, ctx) => {
    // Rule 1: If no defaultOptions, every question must provide options
    if (!game.defaultOptions) {
      game.questions.forEach((q, i) => {
        if (!q.options) {
          ctx.addIssue({
            path: ["questions", i, "options"],
            code: "custom",
            message: "Question must have options if game has no defaultOptions",
          });
        }
      });
    }

    // Rule 2: If no defaultTimeLimit, every question must provide timeLimit
    if (!game.defaultTimeLimit) {
      game.questions.forEach((q, i) => {
        if (!q.timeLimit) {
          ctx.addIssue({
            path: ["questions", i, "timeLimit"],
            code: "custom",
            message:
              "Question must have a timeLimit if game has no defaultTimeLimit",
          });
        }
      });
    }
  });

// Game schema
const GameRuntimeSchema = z
  .object({
    name: z.string(),
    defaultOptions: OptionsSchema.optional(),
    defaultTimeLimit: z.number().optional(),
    questions: z.array(QuestionRuntimeSchema).min(1),
  })
  .superRefine((game, ctx) => {
    // Rule 1: If no defaultOptions, every question must provide options
    if (!game.defaultOptions) {
      game.questions.forEach((q, i) => {
        if (!q.options) {
          ctx.addIssue({
            path: ["questions", i, "options"],
            code: "custom",
            message: "Question must have options if game has no defaultOptions",
          });
        }
      });
    }

    // Rule 2: If no defaultTimeLimit, every question must provide timeLimit
    if (!game.defaultTimeLimit) {
      game.questions.forEach((q, i) => {
        if (!q.timeLimit) {
          ctx.addIssue({
            path: ["questions", i, "timeLimit"],
            code: "custom",
            message:
              "Question must have a timeLimit if game has no defaultTimeLimit",
          });
        }
      });
    }
  });

// Lobby schema
export const LobbySchema = z.object({
  lobbyCode: z.string(),
  hostId: z.string(),
  players: z.record(z.string(), PlayerSchema),
  startTime: z.string(), // ISO string
  lobbyStatus: LobbyStatusSchema,
  gameInfo: GameRuntimeSchema,
  currentQuestion: z.uuid(), // points to the id of the question
  questionOrder: z.array(z.uuid()), // defines play order
  currentIndex: z.number().min(0), // which index we’re at in the order
  gameOptions: GameOptionsSchema,
});

// Infer TypeScript types automatically
export type Player = z.infer<typeof PlayerSchema>;
export type QuestionAuthor = z.infer<typeof QuestionAuthorSchema>;
export type QuestionRuntime = z.infer<typeof QuestionRuntimeSchema>;
export type LobbyStatus = z.infer<typeof LobbyStatusSchema>;
export type AnswerType = z.infer<typeof AnswerType>;
export type DisplayType = z.infer<typeof DisplayType>;
export type Options = z.infer<typeof OptionsSchema>;
export type CorrectAnswer = z.infer<typeof CorrectAnswerSchema>;
export type PlayerAnswers = z.infer<typeof AnswerRuntimeSchema>;
export type Lobby = z.infer<typeof LobbySchema>;
export type GameAuthor = z.infer<typeof GameAuthorSchema>;
export type GameRuntime = z.infer<typeof GameRuntimeSchema>;
export type GameOptions = z.infer<typeof GameOptionsSchema>;
