import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type {
  Drawing,
  Lobby,
  Matching,
  MultiSelect,
  Player,
  QuestionRuntime,
  Ranking,
  ShortAnswer,
  SingleSelect,
} from "../../../common/types";
import styles from "./index.module.css";
import { useEffect, useState } from "react";
import {
  calculatePoints,
  getBasePoints,
  getColorConfig,
  getEntries,
} from "../../logic";
import React from "react";
import { OPTION_COLOR_MAP, OPTION_COLORS } from "../../../common/theme";
import CheckCircleIcon from "@mui/icons-material/Check";
import PlayerAvatar from "../../../common/components/icons";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import BaseTextField from "../../../common/components/Textfield";
import CanvasDraw from "react-canvas-draw";

export type ShowAnswerHeaderProps = {
  question: QuestionRuntime["promptText"];
  onNext: () => void;
};

export function ShowAnswerHeader({ onNext, question }: ShowAnswerHeaderProps) {
  return (
    <div className={styles.showAnswerHeaderRow}>
      {question && <Typography>{question}</Typography>}
      <Button className={styles.nextButton} onClick={onNext} variant="primary">
        Next
      </Button>
    </div>
  );
}

type LocalPlayerState = Player & {
  originalStreak: number;
  originalScore: number;

  accuracy: number;
  pointsEarned: number; // Points earned for this question
  isManualPoints: boolean; // If host overrided the score without factoring streak/time etc.
  basePointsInput: number; // what host inputs in the textfield
  timeTakenMs: number; // From the PlayerAnswer -> added it here so dont need to look at another object
};

function initializePlayerState(
  question: QuestionRuntime,
  players: Lobby["players"]
): LocalPlayerState[] {
  return Object.values(players).map((player) => {
    const { playerAnswers, doublePoints } = question;
    const answerData = playerAnswers?.[player.uid];

    return {
      ...player,
      originalScore: answerData?.scoreEarned ?? 0,
      originalStreak: answerData?.streakAtStart ?? 0,
      accuracy: answerData?.accuracy ?? 0,
      pointsEarned: answerData?.scoreEarned ?? 0,
      isManualPoints: false,
      basePointsInput: getBasePoints(doublePoints),
      timeTakenMs: answerData?.timeTaken ?? question.timeLimit,
    };
  });
}

export type ShowAnswerFooter = {
  lobbyCode: Lobby["lobbyCode"];
} & Pick<HostControlPanelProps, "currentPlayers" | "question">;

export function ShowAnswerFooter({
  currentPlayers,
  lobbyCode,
  question,
}: ShowAnswerFooter) {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const saveHandler = (
    updatedPlayers: Parameters<HostControlPanelProps["onSave"]>[0]
  ) => {
    console.log(updatedPlayers);
    setDrawerOpen(false);

    // TO DO UPDATE DB FOR PLAYER ANSWER AND CONVERT LOCAL TO DB
  };

  return (
    <>
      <div className={styles.showAnswerFooterRow}>
        <Button variant="primary" onClick={() => setDrawerOpen(true)}>
          Open Host Controls
        </Button>
        <Typography className={styles.lobbyCode}>
          Lobby Code: {lobbyCode}
        </Typography>
      </div>
      <HostControlPanel
        currentPlayers={currentPlayers}
        onClose={() => setDrawerOpen(false)}
        onSave={saveHandler}
        open={drawerOpen}
        question={question}
      />
    </>
  );
}

type ColumnConfig = {
  size: number;
  label: string;
};

type ControlConfigKey =
  | "name"
  | "correct"
  | "manual"
  | "basePoints"
  | "finalScore";

const CONTROL_COLUMN_CONFIG: Record<ControlConfigKey, ColumnConfig> = {
  name: { size: 2, label: "Player" },
  correct: { size: 1, label: "Is Correct" },
  manual: { size: 2, label: "Manual Score" },
  basePoints: { size: 4, label: "Base Points" },
  finalScore: { size: 3, label: "Final Score" },
};

type HostControlPanelProps = {
  onClose: () => void;
  open: boolean;
  question: QuestionRuntime;
  currentPlayers: Lobby["players"];
  onSave: (newPlayerData: LocalPlayerState[]) => void;
};

function HostControlPanel({
  onClose,
  open,
  currentPlayers,
  onSave,
  question,
}: HostControlPanelProps) {
  const [localPlayerState, setLocalPlayerState] = useState<LocalPlayerState[]>(
    () => initializePlayerState(question, currentPlayers)
  );

  useEffect(() => {
    if (open) {
      setLocalPlayerState(initializePlayerState(question, currentPlayers));
    }
  }, [open, question, currentPlayers]);

  const updatePlayerRow = (uid: string, updates: Partial<LocalPlayerState>) => {
    setLocalPlayerState((prev) =>
      prev.map((p) => {
        if (p.uid !== uid) return p;

        // Merge the new change
        const updatedPlayer = { ...p, ...updates };

        // RE-CALCULATION LOGIC
        let finalPoints = 0;

        if (updatedPlayer.isManualPoints) {
          // Mode A: Literal Score
          finalPoints = updatedPlayer.basePointsInput;
        } else {
          // Mode B: Formula Score
          finalPoints = calculatePoints({
            accuracy: updatedPlayer.accuracy,
            customBasePoints: updatedPlayer.basePointsInput,
            timeTakenMs: updatedPlayer.timeTakenMs,
            questionTimeLimit: question.timeLimit,
            streak: updatedPlayer.originalStreak,
            isDoublePoints: question.doublePoints,
          });
        }

        return { ...updatedPlayer, pointsEarned: finalPoints };
      })
    );
  };

  return (
    <Drawer open={open} onClose={onClose} anchor="bottom">
      <div className={styles.hostControlDrawer}>
        <Grid container spacing={2}>
          {Object.values(CONTROL_COLUMN_CONFIG).map((col) => (
            <Grid
              key={col.label}
              size={col.size}
              className={styles.tableHeader}
            >
              <Typography>{col.label}</Typography>
            </Grid>
          ))}
          {localPlayerState.map((player) => {
            const playerId = player.uid;
            return (
              <React.Fragment key={player.uid}>
                {getEntries(CONTROL_COLUMN_CONFIG).map(([key, col]) => {
                  return (
                    <Grid
                      key={key}
                      size={col.size}
                      className={styles.centeredCell}
                    >
                      {/* 1. Name Column */}
                      {key === "name" && (
                        <Typography className={styles.playerName}>
                          {player.nickname}
                        </Typography>
                      )}

                      {/* 2. Checkbox Column */}
                      {key === "correct" && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexDirection: "column",
                          }}
                        >
                          <Checkbox
                            // 1. Fully checked only if 100% correct
                            checked={player.accuracy === 1}
                            // 2. Show a dash (—) if they got partial points
                            indeterminate={
                              player.accuracy > 0 && player.accuracy < 1
                            }
                            onChange={(_, checked) => {
                              updatePlayerRow(playerId, {
                                // If they check it, give 100% accuracy. If they uncheck, 0%.
                                accuracy: checked ? 1 : 0,
                              });
                            }}
                          />

                          {/* 3. Optional: Show the % text so the host isn't confused by the dash */}
                          {player.accuracy > 0 && player.accuracy < 1 && (
                            <Typography>
                              {Math.round(player.accuracy * 100)}%
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* 3. Manual Adjustment Column */}
                      {key === "manual" && (
                        <Checkbox
                          checked={player.isManualPoints}
                          onChange={(_, checked) =>
                            updatePlayerRow(playerId, {
                              isManualPoints: checked,
                            })
                          }
                        />
                      )}

                      {key === "basePoints" && (
                        <TextField
                          type="number"
                          value={player.basePointsInput}
                          slotProps={{
                            htmlInput: {
                              min: -2000,
                              step: 100,
                            },
                          }}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value, 10);

                            updatePlayerRow(player.uid, {
                              basePointsInput: val,
                            });
                          }}
                        />
                      )}

                      {key === "finalScore" && (
                        <Typography>{player.pointsEarned}</Typography>
                      )}
                    </Grid>
                  );
                })}
              </React.Fragment>
            );
          })}
        </Grid>
        <div className={styles.buttonRow}>
          <Button
            variant="cancel"
            onClick={() =>
              setLocalPlayerState(
                initializePlayerState(question, currentPlayers)
              )
            }
          >
            Reset
          </Button>
          <Button variant="primary" onClick={() => onSave(localPlayerState)}>
            Save
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

type HostShowAnswerSingleMultiProps<T extends SingleSelect | MultiSelect> = {
  question: T;
  players: Lobby["players"];
};

export function HostShowAnswerSingleMulti<
  T extends SingleSelect | MultiSelect,
>({ players, question }: HostShowAnswerSingleMultiProps<T>) {
  const { options, answerType, correctAnswer, playerAnswers } = question;

  const playerList = Object.values(players);
  const totalPlayerCount = playerList.length;

  return (
    <div className={styles.hostShowAnswerSingleMulti}>
      {options.map((option, i) => {
        const colorKey = OPTION_COLORS[i];
        const { background, color, toggledBg, toggledColor } =
          OPTION_COLOR_MAP[colorKey];
        const isCorrect =
          answerType === "single"
            ? correctAnswer === option
            : correctAnswer.includes(option);
        const bgColor = isCorrect ? toggledBg : background;
        const textColor = isCorrect ? toggledColor : color;

        const playersWhoSelected = playerList.filter((p) => {
          const pAns = playerAnswers?.[p.uid]?.answer;
          if (!pAns) return false;

          // If it's a string, check equality. If it's an array, check inclusion.
          return Array.isArray(pAns) ? pAns.includes(option) : pAns === option;
        });

        const percentage =
          totalPlayerCount > 0
            ? (playersWhoSelected.length / totalPlayerCount) * 100
            : 0;

        return (
          <div className={styles.optionContainer} key={i}>
            <div className={styles.checkmarkContainer}>
              {isCorrect && <CheckCircleIcon />}
            </div>
            <div
              className={styles.optionLabelContainer}
              style={{
                background: bgColor,
                border: `1px solid ${toggledBg}`,
              }}
            >
              <Tooltip title={option}>
                <Typography color={textColor}>{option}</Typography>
              </Tooltip>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${percentage}%`,
                  background: bgColor,
                  color: textColor,
                }}
              >
                {playersWhoSelected.map((p) => {
                  return <Typography key={p.uid}>{p.nickname}</Typography>;
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type HostShowAnswerRankingProps = {
  question: Ranking;
  players: Lobby["players"];
};

export function HostShowAnswerRanking({
  players,
  question,
}: HostShowAnswerRankingProps) {
  const getStats = (index: number): number => {
    // Get all answer objects from the record
    const allAnswers = Object.values(question.playerAnswers);

    // Count how many players have the correct string at this specific index
    const count = allAnswers.reduce((acc, playerAns) => {
      const playerRankChoice = playerAns.answer[index];
      const correctRankChoice = question.correctAnswer[index];

      return playerRankChoice === correctRankChoice ? acc + 1 : acc;
    }, 0);

    return count;
  };

  return (
    <div className={styles.hostShowAnswerRanking}>
      <div className={styles.scaleWrapper}>
        <div className={styles.labelContainer}>
          <Typography component={"span"}>{question.leftLabel}</Typography>
          <Typography component={"span"}>{question.rightLabel}</Typography>
        </div>

        <div className={styles.numberLine}>
          {question.correctAnswer.map((_, i) => {
            const colorKey = OPTION_COLORS[i];
            const { toggledBg } = OPTION_COLOR_MAP[colorKey];
            return (
              /* New wrapper to match the text slot below */
              <div key={i} className={styles.dotContainer}>
                <div className={styles.dot} style={{ background: toggledBg }} />
              </div>
            );
          })}
        </div>

        <div className={styles.correctRow}>
          {question.correctAnswer.map((ans, i) => {
            const colorKey = OPTION_COLORS[i];
            const { toggledBg } = OPTION_COLOR_MAP[colorKey];
            return (
              <div key={i} className={styles.slot}>
                {/* sx={{ width: 'max-content' }} prevents the text from wrapping weirdly */}
                <Typography sx={{ color: toggledBg, fontWeight: 600 }}>
                  {ans}
                </Typography>
                <Chip
                  size="small"
                  label={`+${getStats(i)}`}
                  sx={{ mt: 1, fontSize: "1rem" }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <Divider />

      <div className={styles.playerGrid}>
        {Object.values(players).map((player) => {
          const pAns = question.playerAnswers[player.uid]?.answer || [];
          if (pAns.length === 0) return null;
          return (
            <div key={player.uid} className={styles.playerRow}>
              <div className={styles.playerInfo}>
                <Typography>{player.nickname}</Typography>
              </div>
              <div className={styles.playerChoices}>
                {pAns.map((choice, i) => {
                  const isCorrect = choice === question.correctAnswer[i];
                  const colorKey = isCorrect ? "green" : "red";
                  return (
                    <div key={i} className={styles.slot}>
                      <div
                        className={`${styles.pill}`}
                        style={{
                          background: OPTION_COLOR_MAP[colorKey]["background"],
                          color: OPTION_COLOR_MAP[colorKey]["color"],
                          border: `2px solid ${OPTION_COLOR_MAP[colorKey]["toggledBg"]}`,
                        }}
                      >
                        <Typography>{choice}</Typography>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type HostShowAnswerMatchingProps = {
  question: Matching;
  players: Lobby["players"];
};

export function HostShowAnswerMatching({
  players,
  question,
}: HostShowAnswerMatchingProps) {
  const { options, playerAnswers, correctAnswer } = question;
  const { left, right } = options;
  const leftOptions = Array.from(left);
  const rightOptions = Array.from(right);

  const columnSize = 2;

  const getPairColorConfig = (rightKey: string) => {
    // Get left key in correct answer
    const entry = Object.entries(correctAnswer).find(
      ([_, value]) => value === rightKey
    );

    if (!entry) return getColorConfig(0); // Fallback

    const [leftKey] = entry;
    const leftIndex = leftOptions.indexOf(leftKey);

    // If for some reason the key isn't in leftOptions, index is -1
    return getColorConfig(leftIndex === -1 ? 0 : leftIndex);
  };

  return (
    <Grid
      container
      spacing={2}
      className={styles.hostShowAnswerMatching}
      columns={columnSize * rightOptions.length + columnSize}
    >
      <Grid size={columnSize} sx={{ visibility: "hidden" }} />
      {rightOptions.map((val) => {
        const { toggledColor, toggledBg } = getPairColorConfig(val);
        return (
          <Grid
            key={val}
            size={columnSize}
            className={styles.labelContainer}
            sx={{
              background: toggledBg,
            }}
          >
            <Tooltip title={val}>
              <Typography color={toggledColor}>{val}</Typography>
            </Tooltip>
          </Grid>
        );
      })}
      {leftOptions.map((leftVal, i) => {
        const { toggledColor, toggledBg } = getColorConfig(i);
        return (
          <React.Fragment key={leftVal}>
            <Grid
              size={columnSize}
              sx={{ background: toggledBg }}
              className={styles.labelContainer}
            >
              <Tooltip title={leftVal}>
                <Typography color={toggledColor}>{leftVal}</Typography>
              </Tooltip>
            </Grid>
            {rightOptions.map((rightVal) => {
              const playersWhoMatched = Object.values(players).filter((p) => {
                const answer = playerAnswers[p.uid]?.answer;
                return answer && answer[leftVal] === rightVal;
              });
              const isCorrect = question.correctAnswer[leftVal] === rightVal;
              const colorKey = isCorrect ? "green" : "red";

              return (
                <Grid
                  size={columnSize}
                  key={`${leftVal}-${rightVal}`}
                  sx={{
                    background: OPTION_COLOR_MAP[colorKey]["background"],
                    color: OPTION_COLOR_MAP[colorKey]["color"],
                    border: `2px solid ${OPTION_COLOR_MAP[colorKey]["toggledBg"]}`,
                  }}
                  className={styles.playerCell}
                >
                  {playersWhoMatched.map((p) => (
                    <PlayerAvatar
                      avatarKey={p.avatarKey}
                      tooltip={p.nickname}
                    />
                  ))}
                </Grid>
              );
            })}
          </React.Fragment>
        );
      })}
    </Grid>
  );
}

type HostShowAnswerDrawingProps = {
  question: Drawing | ShortAnswer;
  players: Lobby["players"];
  questionText?: string;
};

export function HostShowAnswerDrawing({
  players,
  question,
  questionText,
}: HostShowAnswerDrawingProps) {
  const { playerAnswers, correctAnswer, answerType } = question;
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const isDrawing = answerType === "draw";

  const renderCorrectMedia = (className?: string) => {
    if (isDrawing) {
      return (
        <img src={correctAnswer} className={className} alt="Correct Answer" />
      );
    }
    return (
      <Typography className={className || styles.correctAnswerText}>
        {correctAnswer}
      </Typography>
    );
  };

  return (
    <div className={styles.hostShowAnswerDrawing}>
      <div className={styles.correctAnswerContainer}>
        {!showCorrectAnswer ? (
          <Button
            onClick={() => setShowCorrectAnswer(true)}
            variant="secondary"
          >
            Reveal Correct Answer
          </Button>
        ) : (
          <>
            {renderCorrectMedia()}
            {isDrawing && (
              <IconButton
                className={styles.zoomInButton}
                onClick={() => setIsZoomed(true)}
              >
                <ZoomInIcon />
              </IconButton>
            )}
          </>
        )}
      </div>
      <div className={styles.playerGrid}>
        {Object.keys(playerAnswers).map((pId) => {
          const player = players[pId];
          const answerData = playerAnswers[pId];
          const isPositiveScore = answerData.scoreEarned > 0;

          return (
            <Button
              className={styles.playerItem}
              onClick={() => setSelectedPlayerId(pId)}
            >
              <Typography className={styles.nickname}>
                {player.nickname}
              </Typography>
              <Typography
                color={
                  OPTION_COLOR_MAP[isPositiveScore ? "green" : "red"][
                    "toggledBg"
                  ]
                }
              >{`${isPositiveScore ? "+" : "-"} ${answerData.scoreEarned}`}</Typography>
            </Button>
          );
        })}
      </div>
      {isZoomed && isDrawing && (
        <CorrectAnswerDialog onClose={() => setIsZoomed(false)}>
          {renderCorrectMedia(styles.correctAnswerImage)}
        </CorrectAnswerDialog>
      )}
      {selectedPlayerId !== null && (
        <PlayerAnswerDialog
          onClose={() => setSelectedPlayerId(null)}
          playerNickname={players[selectedPlayerId].nickname}
          question={questionText}
          score={playerAnswers[selectedPlayerId].scoreEarned}
          correctAnswer={renderCorrectMedia(
            isDrawing
              ? styles.correctAnswerPlayer
              : styles.correctAnswerDialogText
          )}
          playerAnswer={
            isDrawing ? (
              <CanvasDraw
                saveData={playerAnswers[selectedPlayerId].answer as string}
                disabled
                hideGrid
                canvasWidth={350}
                canvasHeight={400}
              />
            ) : (
              <Typography className={styles.playerAnswerText}>
                {playerAnswers[selectedPlayerId].answer as string}
              </Typography>
            )
          }
        />
      )}
    </div>
  );
}

type CorrectAnswerDialogProps = {
  children: React.ReactNode;
  onClose: () => void;
};

function CorrectAnswerDialog({ children, onClose }: CorrectAnswerDialogProps) {
  return (
    <Dialog onClose={onClose} open={true}>
      {children}
    </Dialog>
  );
}

type PlayerAnswerDialogProps = {
  playerNickname: string;
  playerAnswer: React.ReactNode;
  correctAnswer: React.ReactNode;
  score: number;
  onClose: () => void;
  question?: string;
};

/**Saves score to db */
function PlayerAnswerDialog({
  correctAnswer,
  onClose,
  playerAnswer,
  playerNickname,
  score,
  question,
}: PlayerAnswerDialogProps) {
  const [scoreInput, setScoreInput] = useState<string>(String(score));

  const scoreNumber = Number(scoreInput);
  const scoreError = isNaN(scoreNumber);

  useEffect(() => {
    setScoreInput(String(score));
  }, [score]);

  function saveHandler() {}

  return (
    <Dialog
      onClose={onClose}
      open={true}
      className={styles.playerAnswerDialog}
      slotProps={{
        paper: {
          sx: {
            minWidth: "900px",
            width: "100%",
            overflowX: "hidden",
            minHeight: "450px",
          },
        },
      }}
    >
      <DialogTitle>{question ?? "Score"}</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <div className={styles.answerCol}>
          <Typography className={styles.playerLabel}>
            {playerNickname}
          </Typography>
          {playerAnswer}
        </div>
        <div className={styles.answerCol}>
          <Typography className={styles.playerLabel}>Correct Answer</Typography>
          {correctAnswer}
        </div>
      </DialogContent>
      <DialogActions className={styles.dialogFooter}>
        <BaseTextField
          labelText="Score"
          onChange={(value) => setScoreInput(value)}
          labelAlignment="start"
          slotProps={{
            textField: {
              value: scoreInput,
              error: scoreError || scoreInput.length === 0,
              helperText: scoreError ? "Invalid Score" : "",
              sx: {
                height: "100%",
              },
              slotProps: {
                input: {
                  sx: {
                    height: "100%",
                  },
                },
              },
            },
            formControlLabel: {
              sx: {
                height: "40px !important",
                width: "25%",
              },
            },
          }}
        />
        <div className={styles.buttonContainer}>
          <Button variant="cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveHandler}
            disabled={scoreError || scoreInput.length === 0}
          >
            Save
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
