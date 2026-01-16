import { AVATAR_KEYS } from "../common/components/icons";
import type {
  QuestionType,
  DisplayType,
  Lobby,
  Player,
  QuestionRuntime,
  PlayerAnswer,
} from "../common/types";
import {
  calculateAccuracy,
  calculatePoints,
  isSubjectiveQuestionType,
} from "../pages/logic";

export function getQuestionIndex({
  numOptions,
  answerType,
  displayType,
}: {
  numOptions?: number;
  answerType?: QuestionType;
  displayType?: DisplayType;
}): number {
  // 1. EXACT MATCHES (Priority 1)
  if (numOptions === 2 && answerType === "single" && displayType === "text")
    return 0;
  if (numOptions === 3 && answerType === "single" && displayType === "image")
    return 1;
  if (numOptions === 4 && answerType === "multi" && displayType === "text")
    return 2;
  if (numOptions === 5 && answerType === "multi" && displayType === "text")
    return 3;
  if (numOptions === 4 && answerType === "single" && displayType === "video")
    return 4;
  if (numOptions === 6 && answerType === "single" && displayType === "video")
    return 5;

  // 2. STRUCTURAL MATCHES (When displayType is undefined or doesn't match above)
  // This handles your specific request: numOptions 2 + single = index 0
  if (numOptions === 2 && answerType === "single") return 0;
  if (numOptions === 3 && answerType === "single") return 1;
  if (numOptions === 4 && answerType === "multi") return 2;
  if (numOptions === 5 && answerType === "multi") return 3;
  if (numOptions === 4 && answerType === "single") return 4;
  if (numOptions === 6 && answerType === "single") return 5;

  // 3. ANSWER TYPE FALLBACKS (Priority 2)
  if (answerType === "matching") return 6;
  if (answerType === "ranking") return 7;
  if (answerType === "draw") return 8;
  if (answerType === "shortAnswer") return 9;

  // Generic single/multi fallbacks if numOptions is weird
  if (answerType === "multi") return 2;
  if (answerType === "single") return 0; // Changed from 5 to 0 for a "safer" default

  // 4. NUM OPTIONS FALLBACKS (Priority 3)
  if (numOptions === 2) return 0;
  if (numOptions === 3) return 1;
  if (numOptions === 4) return 2;
  if (numOptions === 5) return 3;
  if (numOptions === 6) return 5;

  // 5. ABSOLUTE DEFAULT
  return 0;
}

export function getTestPlayers(count: number): Lobby["players"] {
  const adjectives = ["Speedy", "Shark", "Mighty", "Cool", "Golden"];
  const nouns = ["Z", "Thia", "Runner", "Gamer", "Ace"];

  return Array.from({ length: count }).reduce<Lobby["players"]>((acc, _, i) => {
    const uid = (1000 + i).toString();
    const randomNick = `${adjectives[i % adjectives.length]}${nouns[i % nouns.length]}${i > 4 ? i : ""}`;
    const randomAvatar =
      AVATAR_KEYS[Math.floor(Math.random() * AVATAR_KEYS.length)];

    acc[uid] = {
      uid,
      nickname: randomNick,
      joinDate: new Date().toISOString(),
      score: i * 500,
      streak: i % 4,
      numCorrect: i * 2,
      numAnswered: i * 3,
      avatarKey: randomAvatar,
    };

    return acc;
  }, {});
}

export function getTestingHost(uid: string): Player {
  return {
    uid: uid,
    nickname: "HostShark",
    joinDate: new Date().toISOString(),
    score: 5000,
    streak: 3,
    numCorrect: 10,
    numAnswered: 12,
    avatarKey: "rocket",
  };
}

export function getMockAnswers<T extends QuestionRuntime>(
  players: Lobby["players"],
  question: T
): Record<string, PlayerAnswer<T["correctAnswer"]>> {
  const uids = Object.keys(players);

  return uids.reduce<Record<string, PlayerAnswer<T["correctAnswer"]>>>(
    (acc, uid, i) => {
      const player = players[uid];

      const isActuallyCorrect = i % 2 === 0;
      const timeTaken = 5000 + i * 2000;

      let mockValue: T["correctAnswer"];

      const getRandomColor = () =>
        `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      const getRandom = <K>(arr: K[]): K =>
        arr[Math.floor(Math.random() * arr.length)];
      const shuffle = <K>(arr: K[]): K[] =>
        [...arr].sort(() => Math.random() - 0.5);

      switch (question.answerType) {
        case "single": {
          const wrongOptions = question.options.filter(
            (opt) => opt !== question.correctAnswer
          );
          mockValue = (
            isActuallyCorrect ? question.correctAnswer : getRandom(wrongOptions)
          ) as T["correctAnswer"];
          break;
        }

        case "multi": {
          if (isActuallyCorrect) {
            mockValue = question.correctAnswer;
          } else {
            // For a wrong multi-select, pick a random number of random options
            // that doesn't exactly match the correct answer array
            let randomSelection: string[];
            do {
              randomSelection = shuffle(question.options).slice(
                0,
                Math.floor(Math.random() * question.options.length) + 1
              );
            } while (
              // Keep trying if we accidentally picked exactly the correct answer
              JSON.stringify(randomSelection.sort()) ===
              JSON.stringify([...(question.correctAnswer as string[])].sort())
            );
            mockValue = randomSelection;
          }
          break;
        }

        case "matching": {
          if (isActuallyCorrect) {
            mockValue = question.correctAnswer;
          } else {
            const keys = Object.keys(question.correctAnswer);
            const values = shuffle(Object.values(question.correctAnswer));
            const mismatched: Record<string, string> = {};
            keys.forEach((key, index) => {
              mismatched[key] = values[index];
            });
            mockValue = mismatched as T["correctAnswer"];
          }
          break;
        }

        case "ranking": {
          mockValue = (
            isActuallyCorrect
              ? question.correctAnswer
              : shuffle(question.options)
          ) as T["correctAnswer"]; // Fully random order
          break;
        }

        case "draw":
          const numLines = Math.floor(Math.random() * 3) + 1; // 1 to 3 lines

          const lines = Array.from({ length: numLines }).map(() => ({
            points: [
              { x: Math.random() * 300, y: Math.random() * 300 },

              { x: Math.random() * 300, y: Math.random() * 300 },

              { x: Math.random() * 300, y: Math.random() * 300 },
            ],

            brushColor: getRandomColor(),

            brushRadius: Math.floor(Math.random() * 10) + 2,
          }));

          mockValue = JSON.stringify({
            lines,

            width: 400,

            height: 400,
          }) as T["correctAnswer"];

          break;

        case "shortAnswer":
          const sillyWrongAnswers = [
            "I have no idea!",
            "Is it 42?",
            "I'm just guessing at this point.",
            "Pass!",
            "Wait, I know this one...",
          ];
          mockValue = (
            isActuallyCorrect
              ? "The correct subjective response"
              : getRandom(sillyWrongAnswers)
          ) as T["correctAnswer"];
          break;
      }
      const accuracy = calculateAccuracy(question, mockValue);
      acc[uid] = {
        answer: mockValue,
        timeTaken: timeTaken,
        accuracy: accuracy,
        streakAtStart: player.streak,
        scoreEarned: calculatePoints({
          accuracy,
          isDoublePoints: question.doublePoints,
          questionTimeLimit: question.timeLimit,
          streak: player.streak,
          timeTakenMs: timeTaken,
          ignoreTimePoints: isSubjectiveQuestionType(question.answerType),
        }),
      };

      return acc;
    },
    {}
  );
}

export function injectAnswers<T extends QuestionRuntime>(
  question: T,
  players: Lobby["players"]
): T {
  return {
    ...question,
    playerAnswers: getMockAnswers(players, question),
  };
}
