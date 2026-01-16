import { Divider, Typography } from "@mui/material";
import type { Lobby, Player, QuestionRuntime } from "../../../common/types";
import {
  HostShowAnswerDrawing,
  HostShowAnswerMatching,
  HostShowAnswerRanking,
  HostShowAnswerSingleMulti,
  ShowAnswerFooter,
  ShowAnswerHeader,
  type ShowAnswerHeaderProps,
} from "./HostComponents";
import styles from "./index.module.css";
import { MediaDisplayContainer } from "../answering";
import { getUpdatedPlayer, isQuestionCorrect } from "../../logic";
import PlayerAvatar from "../../../common/components/icons";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { OPTION_COLOR_MAP } from "../../../common/theme";

type ShowAnswerHostPageProps = {
  question: QuestionRuntime;
  onNextPhase: ShowAnswerHeaderProps["onNext"];
  players: Lobby["players"];
  lobbyCode: Lobby["lobbyCode"];
};

export function ShowAnswerHostPage({
  onNextPhase,
  question,
  lobbyCode,
  players,
}: ShowAnswerHostPageProps) {
  const { promptText, correctAnswerDisplay, answerType } = question;

  let content = null;

  switch (answerType) {
    case "single":
    case "multi":
      content = (
        <HostShowAnswerSingleMulti players={players} question={question} />
      );
      break;
    case "matching":
      content = (
        <HostShowAnswerMatching players={players} question={question} />
      );
      break;
    case "ranking":
      content = <HostShowAnswerRanking players={players} question={question} />;
      break;
    case "draw":
    case "shortAnswer":
      content = (
        <HostShowAnswerDrawing
          players={players}
          question={question}
          questionText={question.promptText}
        />
      );
      break;
  }

  return (
    <div className={styles.showAnswerHostContainer}>
      <ShowAnswerHeader onNext={onNextPhase} question={promptText} />
      {correctAnswerDisplay && (
        <div className={styles.displayContainerShowAnswer}>
          {correctAnswerDisplay.promptText && (
            <Typography>{correctAnswerDisplay.promptText}</Typography>
          )}
          {correctAnswerDisplay.displayType === "video" && (
            <MediaDisplayContainer
              videoProps={{
                videoUrl: correctAnswerDisplay.videoUrl,
                endTime: correctAnswerDisplay.endTime,
                loop: correctAnswerDisplay.loop,
                startTime: correctAnswerDisplay.startTime,
              }}
            />
          )}
          {correctAnswerDisplay.displayType === "image" && (
            <MediaDisplayContainer
              imageProps={{ imageUrl: correctAnswerDisplay.imageUrl }}
            />
          )}
        </div>
      )}
      {content}
      <Divider className={styles.divider} />
      <ShowAnswerFooter
        lobbyCode={lobbyCode}
        currentPlayers={players}
        question={question}
      />
    </div>
  );
}

type ShowAnswerPlayerProps = {
  player: Player;
  question: QuestionRuntime;
};

// TO DO make this use the root index.module.css styles
export function ShowAnswerPlayerPage({
  player,
  question,
}: ShowAnswerPlayerProps) {
  const updatedPlayer = getUpdatedPlayer(question, player);
  const { playerAnswers } = question;
  const { nickname, streak, score, avatarKey, uid } = updatedPlayer;

  const playerAnswer = playerAnswers[uid];
  const isCorrect = playerAnswer
    ? isQuestionCorrect(playerAnswer.accuracy)
    : false;
  const isPositiveScore = playerAnswer ? playerAnswer.scoreEarned > 0 : false;

  return (
    <div className={styles.playerShowAnswer}>
      <div className={styles.playerShowAnswerHeader}>
        <Typography>New Score: {score}</Typography>
        <Typography>New Streak: {streak}</Typography>
      </div>
      <div className={styles.mainContainer}>
        {playerAnswer === undefined && (
          <>
            <Typography className={styles.noAnswerText}>
              It seems like you didn't answer in time...
            </Typography>
            <Typography className={styles.noAnswerText}>
              Perhaps we will have better UI in the future
            </Typography>
          </>
        )}
        {playerAnswer && (
          <>
            <Typography
              color={OPTION_COLOR_MAP[isCorrect ? "green" : "red"]["toggledBg"]}
              className={styles.title}
            >
              {isCorrect ? "Correct!" : "Incorrect"}
            </Typography>
            {isCorrect ? (
              <CheckIcon
                style={{ color: OPTION_COLOR_MAP["green"]["toggledBg"] }}
              />
            ) : (
              <CloseIcon
                style={{ color: OPTION_COLOR_MAP["red"]["toggledBg"] }}
              />
            )}
            <Typography className={styles.score}>
              {`${isPositiveScore ? "+" : ""} ${playerAnswer.scoreEarned}`}
            </Typography>
          </>
        )}
      </div>
      <div className={styles.playerShowAnswerFooter}>
        <Typography>{nickname}</Typography>
        <PlayerAvatar avatarKey={avatarKey} />
      </div>
    </div>
  );
}
