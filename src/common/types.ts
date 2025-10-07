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
  imageUrl: z.string().min(1),
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

/* ---------- correctAnswer shapes (no answerType tag) ---------- */
const CorrectByType = {
  single: z.string(),
  multi: z.array(z.string()),
  matching: z.record(z.string(), z.string()),
  ranking: z.array(z.string()),
} as const satisfies Record<
  "single" | "multi" | "matching" | "ranking",
  z.ZodTypeAny
>;

const QuestionAuthorSchema = z
  .object({
    timeLimit: z.number().optional(),
    options: OptionsSchema.optional(),
    correctAnswer: z.any(),
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
});

// Game schema
export const GameAuthorSchema = z.object({
  name: z.string(),
  defaultOptions: OptionsSchema.optional(),
  defaultTimeLimit: z.number().optional(),
  questions: z.array(QuestionAuthorSchema).min(1),
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
    game.questions.forEach((q, i) => {
      const effectiveOptions = q.options ?? game.defaultOptions;
      const effectiveTimeLimit = q.timeLimit ?? game.defaultTimeLimit;
      if (!effectiveOptions) {
        ctx.addIssue({
          path: ["questions", i, "options"],
          code: "custom",
          message:
            "Question must have options (or game must provide defaultOptions).",
        });
        return; // skip further checks for this question
      }

      if (!effectiveTimeLimit) {
        ctx.addIssue({
          path: ["questions", i, "timeLimit"],
          code: "custom",
          message:
            "Question must have a timeLimit if game has no defaultTimeLimit",
        });
      }

      // 2) ensure correctAnswer exists
      if (q.correctAnswer === undefined || q.correctAnswer === null) {
        ctx.addIssue({
          path: ["questions", i, "correctAnswer"],
          code: "custom",
          message: "Question must include a correctAnswer.",
        });
        return;
      }

      // 3) validate correctAnswer against schema appropriate for answerType
      const validator = CorrectByType[effectiveOptions.answerType];
      const parseResult = validator.safeParse(q.correctAnswer);
      if (!parseResult.success) {
        ctx.addIssue({
          path: ["questions", i, "correctAnswer"],
          code: "custom",
          message: `correctAnswer does not match expected shape for answerType "${effectiveOptions.answerType}".`,
        });
      }
    });
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
export type PlayerAnswers = z.infer<typeof AnswerRuntimeSchema>;
export type Lobby = z.infer<typeof LobbySchema>;
export type GameAuthor = z.infer<typeof GameAuthorSchema>;
export type GameRuntime = z.infer<typeof GameRuntimeSchema>;
export type GameOptions = z.infer<typeof GameOptionsSchema>;
