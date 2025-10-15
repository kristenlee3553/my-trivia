import { Box, Typography } from "@mui/material";
import { PreviewComponent } from "./PreviewComponent";
import type { QuestionRuntime } from "../../../common/types";
import styles from "./PreviewPage.module.css";

type PreviewPageProps = {
  isHost: boolean;
  question: QuestionRuntime;
  questionNumber: number;
  totalQuestions: number;
  onPreviewComplete: () => void;
};

export default function PreviewPage({
  isHost,
  question,
  questionNumber,
  totalQuestions,
  onPreviewComplete,
}: PreviewPageProps) {
  return isHost ? (
    <PreviewComponent
      question={question}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onComplete={onPreviewComplete}
    />
  ) : (
    <Box className={styles.playerPreviewContainer}>
      <Typography variant="h1">Look up at the host screen!</Typography>
      <Typography>
        Perhaps in the future, there will be cool UI here...
      </Typography>
    </Box>
  );
}
