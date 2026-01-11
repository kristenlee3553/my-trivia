import { createContext, useContext, useState, type ReactNode } from "react";
import type { DisplayType, Lobby, QuestionType } from "../common/types";
import introGame from "../games/intro";
import { createRuntimeGame } from "../firebase/lobby";

type LobbyContextType = {
  lobby: Lobby | null;
  setLobby: React.Dispatch<React.SetStateAction<Lobby | null>>;
};

function getQuestionIndex(
  numOptions: number,
  answerType: QuestionType,
  displayType: DisplayType
): number {
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
  if (answerType === "single") return 5;
  if (answerType === "multi") return 2;
  if (answerType === "matching") return 6;
  if (answerType === "ranking") return 7;
  if (answerType === "draw") return 8;
  if (answerType === "shortAnswer") return 9;

  if (numOptions === 2) return 0;
  if (numOptions === 3) return 1;
  if (numOptions === 4) return 2;
  if (numOptions === 5) return 3;
  if (numOptions === 6) return 5;

  return 0;
}

function getTestingLobby() {
  const game = createRuntimeGame(introGame);
  //const questionIndex = 20;
  const questionIndex = getQuestionIndex(4, "draw", "image");
  const testingLobby: Lobby = {
    currentIndex: questionIndex,
    lobbyCode: "1234",
    hostId: "1",
    players: {},
    lobbyStatus: "answering",
    startTime: "",
    lastUpdated: "",
    gameData: game,
    currentQuestion: game.questions[questionIndex].id,
    questionOrder: [],
    gameOptions: {
      shuffleQuestions: false,
      shuffleAnswers: false,
    },
  };
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
