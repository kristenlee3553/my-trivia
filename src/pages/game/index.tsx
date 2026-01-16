import ThemeWrapper from "../../common/theme";
import { useLobby } from "../../context/LobbyContext";
import { useUser } from "../../context/UserContext";
import SomethingWentWrong from "../error/SomethingWentWrong";
import { HostAnswerPage, PlayerAnswerPage } from "./answering";
import { ShowAnswerHostPage, ShowAnswerPlayerPage } from "./showAnswer";
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

  if (!playerData) {
    return <SomethingWentWrong optionalText="No Player Data" />;
  }

  const isHost = true;
  const currentQuestion = lobby?.gameData.questions.find(
    (question) => question.id === lobby.currentQuestionId
  );

  if (!currentQuestion) {
    return (
      <SomethingWentWrong optionalText="Current Question cannot be found" />
    );
  }

  function onQuestionPreviewFinish() {}

  // Only update the playerAnswerData in the question. Player remains the same. PlayerAnswerData = snapshot of the points for this question.
  function onAnsweringFinish() {}

  // Update Player object and PlayerAnswerData. This is final.
  function onShowAnswerFinish() {}

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
        <PlayerAnswerPage question={currentQuestion} player={playerData} />
      );
      break;
    case "showAnswer":
      content = isHost ? (
        <ShowAnswerHostPage
          question={currentQuestion}
          onNextPhase={onShowAnswerFinish}
        />
      ) : (
        <ShowAnswerPlayerPage question={currentQuestion} player={playerData} />
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
