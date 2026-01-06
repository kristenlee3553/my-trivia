import { Button, Stack, Typography } from "@mui/material";
import ThemeWrapper from "../../common/theme";
import type { GameRuntime } from "../../common/types";
import { createRuntimeGame } from "../../firebase/lobby";
import { gameFiles } from "../host/HostPage";
import BaseOptionGrid from "../game/options/BaseOption";
import BaseCheckbox from "../../common/components/Checkbox";
import { useState } from "react";
import styles from "./index.module.css";
import { useNavigate } from "react-router-dom";

const game: GameRuntime = createRuntimeGame(gameFiles.intro);

export default function PreviewPage() {
  const [isHost, setIsHost] = useState<boolean>(true);
  const [curQuestionIndex, setCurQuestionIndex] = useState<number>(0);
  const curQuestion = game.questions[curQuestionIndex];

  let content = (
    <Typography color="yellow">{`NOT SUPPORTED YET: ${curQuestion.promptText}`}</Typography>
  );

  if (curQuestion.options) {
    if (
      curQuestion.answerType === "single" ||
      curQuestion.answerType === "multi"
    ) {
      content = (
        <BaseOptionGrid
          options={curQuestion.options}
          onSubmit={
            isHost
              ? undefined
              : (answer) => console.log("Selected answer: ", answer)
          }
          answerType={curQuestion.answerType}
          hideSubmitButton
        />
      );
    }
  }

  return (
    <ThemeWrapper>
      <Stack spacing={1} className={styles.previewPageContainer}>
        {content}
        <ControlBar
          setIsHost={() => setIsHost(!isHost)}
          isHost={isHost}
          onNext={() =>
            setCurQuestionIndex((prev) => (prev + 1) % game.questions.length)
          }
          onBack={() =>
            setCurQuestionIndex(
              (prev) =>
                (prev - 1 + game.questions.length) % game.questions.length
            )
          }
        />
      </Stack>
    </ThemeWrapper>
  );
}

function ControlBar({
  setIsHost,
  isHost,
  onNext,
  onBack,
}: {
  setIsHost: () => void;
  isHost: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  return (
    <Stack padding={"20px"} spacing={1.5}>
      <Stack direction="row" justifyContent={"center"} spacing={1}>
        <BaseCheckbox
          onChange={setIsHost}
          checked={isHost}
          label={"Host View"}
        />
        <Button variant="primary" onClick={onBack}>
          Previous
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next
        </Button>
      </Stack>
      <Button variant="cancel" onClick={() => navigate("/host")}>
        Back to Game Lobby
      </Button>
    </Stack>
  );
}
