import type { Game } from "../common/types";

const introJson: Game = {
  name: "Introduction",
  questions: [
    {
      type: "text",
      promptText: "What's your favorite color?",
      answerType: "single",
      options: ["Red", "Blue", "Green"],
      correctAnswer: "Blue",
      answers: {},
    },
  ],
};

export default introJson;
