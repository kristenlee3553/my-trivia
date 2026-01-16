import { Button, Divider, Fade, Typography } from "@mui/material";
import type { Lobby, Player, QuestionRuntime } from "../../../common/types";
import styles from "./index.module.css";
import playerStyles from "../index.module.css";
import { getSortedPlayersByScore } from "../../logic";
import PlayerAvatar from "../../../common/components/icons";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { OPTION_COLOR_MAP } from "../../../common/theme";

type HostLeaderboardPageProps = {
  question: QuestionRuntime;
  players: Lobby["players"];
  lobbyCode: Lobby["lobbyCode"];
  onNextPhase: () => void;
};

export function HostLeaderboardPage({
  question,
  onNextPhase,
  players,
  lobbyCode,
}: HostLeaderboardPageProps) {
  const { promptText, playerAnswers } = question;

  const sortedPlayers = getSortedPlayersByScore(players, "desc");
  const topPlayers = sortedPlayers.slice(0, 6);

  return (
    <div className={styles.leaderboardHostContainer}>
      <div className={styles.leaderboardHostHeader}>
        {promptText && <Typography>{promptText}</Typography>}
        <Button
          className={styles.nextButton}
          onClick={onNextPhase}
          variant="primary"
        >
          Next
        </Button>
      </div>
      <div className={styles.mainContent}>
        {topPlayers.map((player, index) => {
          const rank = index + 1;
          const { avatarKey, nickname, score, streak, uid } = player;
          const playerAnswer = playerAnswers[uid];
          const pointsEarned = playerAnswer ? playerAnswer.scoreEarned : null;
          const rankStyle = getRankStyles(rank);
          const isPositiveGain = pointsEarned ? pointsEarned > 0 : false;

          return (
            <Fade in timeout={600 + index * 400} key={uid}>
              <div
                className={styles.playerContainer}
                style={{
                  background:
                    rank === 1
                      ? "rgba(180, 144, 214, 0.05)"
                      : "rgba(28, 43, 94, 0.6)", // Faint primary vs paper background
                  border: rankStyle.border,
                  boxShadow: rankStyle.glow,
                }}
              >
                <Typography className={styles.rank} color={rankStyle.color}>
                  #{rank}
                </Typography>
                <div className={styles.nicknameContainer}>
                  <PlayerAvatar avatarKey={avatarKey} />
                  <Typography className={styles.nickname}>
                    {nickname}
                  </Typography>
                  {streak > 0 && (
                    <div className={styles.streakContainer}>
                      <LocalFireDepartmentIcon sx={getFireStyles(streak)} />
                      <Typography className={styles.streak}>
                        {streak}
                      </Typography>
                    </div>
                  )}
                </div>
                <div className={styles.scoreContainer}>
                  <Typography className={styles.score}>{score}</Typography>
                  <Typography
                    color={OPTION_COLOR_MAP["green"]["toggledBg"]}
                    className={styles.scoreGained}
                  >
                    {isPositiveGain && pointsEarned ? "+" : ""}{" "}
                    {pointsEarned ?? ""}
                  </Typography>
                </div>
              </div>
            </Fade>
          );
        })}
      </div>
      <Divider />
      <div className={styles.showAnswerFooterRow}>
        <Typography className={styles.lobbyCode}>
          Lobby Code: {lobbyCode}
        </Typography>
      </div>
    </div>
  );
}

type PlayerLeaderboardPageProps = {
  players: Lobby["players"];
  player: Player;
  question: QuestionRuntime;
};

export function PlayerLeaderboardPage({
  player,
  players,
  question,
}: PlayerLeaderboardPageProps) {
  const { avatarKey, uid, score, streak, nickname } = player;
  const { playerAnswers } = question;
  const sortedOrder = getSortedPlayersByScore(players, "desc");

  const playerIndex = sortedOrder.findIndex((p) => p.uid === uid);
  const rank = playerIndex !== -1 ? playerIndex + 1 : 0;

  const playerAnswer = playerAnswers[uid];

  return (
    <div className={playerStyles.playerContainer}>
      <div className={playerStyles.playerHeader}>
        <Typography>Score: {score}</Typography>
        <Typography>Streak: {streak}</Typography>
      </div>
      <div className={styles.playerLeaderboardMain}>
        <Typography className={styles.rank}>
          {rank === 0
            ? "Oops looks like you haven't answered any questions yet"
            : `You are #{rank}`}
        </Typography>
        {playerAnswer && (
          <Typography className={styles.scoreEarned}>
            You Earned: {playerAnswer.scoreEarned}
          </Typography>
        )}
      </div>
      <div className={playerStyles.playerFooter}>
        <Typography>{nickname}</Typography>
        <PlayerAvatar avatarKey={avatarKey} />
      </div>
    </div>
  );
}

// TO DO MAKE THESE USE THEME
const getRankStyles = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        color: OPTION_COLOR_MAP.orange.toggledBg, // Sun/Gold Glow
        glow: `0 0 10px ${OPTION_COLOR_MAP.orange.toggledBg}44`,
        border: `1px solid ${OPTION_COLOR_MAP.orange.toggledBg}`,
      };
    case 2:
      return {
        color: OPTION_COLOR_MAP.blue.toggledBg, // Cyan/Silver Glow
        glow: `0 0 10px ${OPTION_COLOR_MAP.blue.toggledBg}44`,
        border: `1px solid ${OPTION_COLOR_MAP.blue.toggledBg}`,
      };
    case 3:
      return {
        color: OPTION_COLOR_MAP.pink.toggledBg, // Pink/Bronze Glow
        glow: `0 0 10px ${OPTION_COLOR_MAP.pink.toggledBg}44`,
        border: `1px solid ${OPTION_COLOR_MAP.pink.toggledBg}`,
      };
    default:
      return {
        color: "#fdeac9", // --light-text
        glow: "none",
        border: "1px solid rgba(182, 225, 250, 0.1)", // Subtle secondary-color
      };
  }
};

const getFireStyles = (streak: number) => {
  // 12+ Supernova (White Hot / Pulsing)
  if (streak >= 12) {
    return {
      color: "#fff",
      filter: `drop-shadow(0 0 8px #FF4D4D) drop-shadow(0 0 15px #FF2E7E)`,
      animation: "pulse-fire 0.8s infinite alternate",
      fontSize: "1.8rem",
    };
  }
  // 7+ Blaze (Intense Orange Glow)
  if (streak >= 7) {
    return {
      color: OPTION_COLOR_MAP.orange.toggledBg,
      filter: `drop-shadow(0 0 10px ${OPTION_COLOR_MAP.orange.toggledBg})`,
      fontSize: "1.5rem",
    };
  }
  // 3+ Spark (Normal Theme Fire)
  if (streak >= 3) {
    return {
      color: "var(--error)", // Your --error color
      fontSize: "1.25rem",
    };
  }
  return {
    color: "var(--error)",
    opacity: 0.8,
    fontSize: "1.1rem",
  };
};
