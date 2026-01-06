import type { GameAuthor, QuestionAuthor } from "../common/types";
import Nectar from "../images/nectar.jpg";

const introGame: GameAuthor = {
  name: "Testing Testing!",
  defaultTimeLimit: 30,
  questions: [
    {
      displayType: "text",
      answerType: "single",
      promptText:
        "First we will start slow with 2 options! In chess, which direction does the bishop move in?",
      options: ["diagonally", "horizontally or vertically"],
      correctAnswer: "diagonally",
    },
    {
      displayType: "image",
      imageUrl: Nectar,
      promptText:
        "Let's bump the options to 3 and add an image! What is the name of this resource in Wingspan?",
      answerType: "single",
      options: ["Flower", "Nectar", "Sakura"],
      correctAnswer: "Nectar",
    },
    {
      displayType: "text",
      promptText:
        "Introducing a new question type! It's multi-select! Select all that are part of the 7 deadly sins!",
      answerType: "multi",
      options: ["Jealousy", "Hypocrisy", "Greed", "Sloth"],
      correctAnswer: ["Sloth, Greed"],
    },
    {
      displayType: "text",
      timeLimit: 45,
      promptText:
        "5 options! Select all the resources required to build a city in Catan!",
      answerType: "multi",
      options: ["Wood", "Brick", "Sheep", "Wheat", "Ore"],
      correctAnswer: ["Wood, Brick, Sheep, Wheat"],
    },
    {
      displayType: "video",
      videoUrl: "https://youtu.be/4hAdcenQWqU?si=boFn3Gs4Zi6hHelj",
      startTime: 37,
      endTime: 53,
      loop: true,
      doublePoints: true,
      promptText: "Double points and a video! What's the name of this song?",
      answerType: "single",
      options: ["Whiplash", "Can't Touch This", "One Look", "Let it go!"],
      correctAnswer: "Whiplash",
    },
    {
      displayType: "video",
      videoUrl: "https://youtu.be/nrZxwPwmgrw?si=hCavd0e-5Q5npvLT",
      promptText:
        "One last video question maybe...? What's the name of this song?",
      answerType: "single",
      options: [
        "Let it Go",
        "Show Yourself",
        "Into the Unknown",
        "Do You Want to Build a Snowman",
        "Love is an Open Door",
        "For the First Time in Forever",
      ],
      correctAnswer: "Show Yourself",
    },
    {
      displayType: "text",
      promptText:
        "Matching Question! Match the elements to their periodic table name!",
      timeLimit: 45,
      doublePoints: true,
      answerType: "matching",
      options: {
        left: new Set<string>([
          "Gold",
          "Silver",
          "Carbon",
          "Calcium",
          "Potassium",
          "Sodium",
        ]),
        right: new Set<string>(["Au", "K", "C", "Ag", "Na", "Ca"]),
      },
      correctAnswer: {
        Gold: "Au",
        Silver: "Ag",
        Carbon: "C",
        Calcium: "Ca",
        Potassium: "K",
        Sodium: "Na",
      },
    },
    {
      displayType: "text",
      timeLimit: 45,
      promptText:
        "Ranking Question! Rank these sports by the number of players on the field! (Most to Least)",
      answerType: "ranking",
      options: ["Basketball", "Soccer", "Baseball", "Ice Hockey"],
      leftLabel: "Most Players",
      rightLabel: "Least Players",
      correctAnswer: ["Soccer", "Baseball", "Ice Hockey", "Basketball"],
    } as QuestionAuthor,
    {
      displayType: "text",
      timeLimit: 45,
      promptText:
        "Final 3 Questions! We're going to break the website! First go to another app, then come back to the game! Don't close the website!",
      answerType: "single",
      options: ["Yay I didn't disconnect", "Don't Click Me!"],
      correctAnswer: "Yay I didn't disconnect",
    },
    {
      displayType: "text",
      timeLimit: 45,
      promptText:
        "Great! Hopefully everything is still okay! Now try closing the Safari app or whatever browser app you're using. Then reopen that app and head back to this website!",
      correctAnswer: "Yay I didn't disconnect",
      answerType: "single",
      options: ["Yay I didn't disconnect", "Don't Click Me!"],
    },
    {
      displayType: "text",
      timeLimit: 45,
      promptText:
        "Final Test! Close this tab/website. Then reenter this website. You should hopefully see a prompt to rejoin the game!",
      correctAnswer: "Yay I didn't disconnect",
      answerType: "single",
      options: ["Yay I didn't disconnect", "Don't Click Me!"],
    },
  ],
};

export default introGame;
