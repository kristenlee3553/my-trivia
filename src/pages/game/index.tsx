import ThemeWrapper from "../../common/theme";
import { useLobby } from "../../context/LobbyContext";
import { useUser } from "../../context/UserContext";
import SomethingWentWrong from "../error/SomethingWentWrong";
import { HostAnswerPage, PlayerAnswerPage } from "./answering";
import QuestionPage from "./question";

export default function GameManager() {
  const { lobby } = useLobby();
  const user = useUser();
  if (!lobby || !user.appUser) {
    console.error("No lobby or user context");
    return <SomethingWentWrong optionalText="No lobby or user context" />;
  }
  const { lobbyStatus, currentIndex, gameData, lobbyCode } = lobby;
  const { playerData } = user.appUser;
  const isHost = true;
  const currentQuestion = lobby?.gameData.questions.find(
    (question) => question.id === lobby.currentQuestion
  );

  if (!currentQuestion) {
    console.error("Current Question cannot be found");
    return (
      <SomethingWentWrong optionalText="Current Question cannot be found" />
    );
  }

  function onQuestionPreviewFinish() {}

  function onAnsweringFinish() {}

  let content;

  switch (lobbyStatus) {
    case "question":
      content = (
        <QuestionPage
          isHost={Boolean(isHost)}
          question={currentQuestion}
          questionNumber={currentIndex}
          totalQuestions={gameData.questions.length}
          onQuestionComplete={onQuestionPreviewFinish}
        />
      );
      break;
    case "answering":
      content = isHost ? (
        <HostAnswerPage
          lobbyCode={lobbyCode}
          onNextPhase={onAnsweringFinish}
          question={currentQuestion}
          questionNumber={currentIndex}
        />
      ) : (
        <PlayerAnswerPage
          question={currentQuestion}
          playerId={playerData?.uid ?? "1111111"}
        />
      );
      break;
    default:
      console.error("Invalid lobby status");
      content = (
        <SomethingWentWrong
          optionalText={`Invalid lobby status: ${lobbyStatus}`}
        />
      );
  }

  return <ThemeWrapper>{content}</ThemeWrapper>;
}
