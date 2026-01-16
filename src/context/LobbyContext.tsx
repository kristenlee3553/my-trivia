import { createContext, useContext, useState, type ReactNode } from "react";
import type { DisplayType, Lobby, QuestionType } from "../common/types";
import introGame from "../games/intro";
import { createRuntimeGame } from "../firebase/lobby";
import { getQuestionIndex, getTestPlayers, injectAnswers } from "../testing";
import { TESTING_LOBBY_CODE } from "../testing/constants";

type LobbyContextType = {
  lobby: Lobby | null;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | null>>;
};

const numOptions: number | undefined = undefined;
const displayType: DisplayType | undefined = undefined;
const answerType: QuestionType | undefined = "single";

function getTestingLobby() {
  let game = createRuntimeGame(introGame);
  //const questionIndex = 0;
  const questionIndex = getQuestionIndex({
    answerType,
    displayType,
    numOptions,
  });

  const players = getTestPlayers(5);

  const currentQuestion = game.questions[questionIndex];
  game.questions[questionIndex] = injectAnswers(currentQuestion, players);

  const testingLobby: Lobby = {
    currentIndex: questionIndex,
    lobbyCode: TESTING_LOBBY_CODE,
    hostId: "1",
    players: players,
    lobbyStatus: "showAnswer",
    startTime: "",
    lastUpdated: "",
    gameData: game,
    currentQuestionId: game.questions[questionIndex].id,
    questionOrder: game.questions.map((q) => q.id),
    gameOptions: {
      shuffleQuestions: false,
      shuffleAnswers: false,
    },
  };

  const now = new Date();
  console.log(`Testing Lobby: ${now.toLocaleTimeString()}: `, testingLobby);
  return testingLobby;
}

const LobbyContext = createContext<LobbyContextType>({
  lobby: getTestingLobby(),
  setLobby: () => {},
});

export function LobbyProvider({ children }: { children: ReactNode }) {
  const [lobby, setLobby] = useState<Lobby | null>(getTestingLobby());

  // Optional: could sync with Firebase here using onValue or get
  // useEffect(() => {
  //   if (!lobbyCode) return;
  //   const lobbyRef = ref(db, `lobbies/${lobbyCode}`);
  //   return onValue(lobbyRef, (snapshot) => {
  //     setLobby(snapshot.val());
  //   });
  // }, [lobbyCode]);

  return (
    <LobbyContext.Provider value={{ lobby, setLobby }}>
      {children}
    </LobbyContext.Provider>
  );
}

export const useLobby = () => useContext(LobbyContext);
