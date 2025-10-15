import ThemeWrapper from "../../common/theme";
import { useLobby } from "../../context/LobbyContext";
import { useUser } from "../../context/UserContext";
import SomethingWentWrong from "../error/SomethingWentWrong";
import PreviewPage from "./preview/PreviewPage";

export default function QuestionsPage() {
  const { lobby } = useLobby();
  const user = useUser();
  if (!lobby || !user.appUser) {
    console.error("No lobby or user context");
    return <SomethingWentWrong />;
  }
  const { lobbyStatus, currentIndex, gameInfo } = lobby;
  const { isHost } = user.appUser;
  const currentQuestion = lobby?.gameInfo.questions.find(
    (question) => question.id === lobby.currentQuestion
  );

  if (!currentQuestion) {
    console.error("Current Question cannot be found");
    return <SomethingWentWrong />;
  }

  let content;

  switch (lobbyStatus) {
    case "preview":
      content = (
        <PreviewPage
          isHost={Boolean(isHost)}
          question={currentQuestion}
          questionNumber={currentIndex}
          totalQuestions={gameInfo.questions.length}
          onPreviewComplete={() => console.log("SHOW QUESTIONS PAGE")}
        />
      );
      break;
    default:
      console.error("Invalid lobby status");
      content = <SomethingWentWrong />;
  }

  return <ThemeWrapper>{content}</ThemeWrapper>;
}
