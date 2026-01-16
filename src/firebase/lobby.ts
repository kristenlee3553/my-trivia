import { ref, get, child, set, remove, update } from "firebase/database";
import { db } from "./firebase";
import { DATABASE } from "./constants";
import {
  PlayerSchema,
  type GameAuthor,
  type GameRuntime,
  type Lobby,
  type Player,
  type QuestionRuntime,
} from "../common/types";
import { v4 as uuidv4 } from "uuid";

export async function checkLobbyExists(lobbyCode: string): Promise<boolean> {
  const dbRef = ref(db);

  try {
    // Check if the child exists
    const snapshot = await get(child(dbRef, `${DATABASE.LOBBY}/${lobbyCode}`));
    if (snapshot.exists()) {
      console.log("Lobby exists:", snapshot.val());
      return true;
    } else {
      console.log("Lobby does NOT exist");
      return false;
    }
  } catch (error) {
    console.error("Error checking lobby:", error);
    return false;
  }
}

export async function addPlayerToLobby(
  lobbyCode: string,
  uid: string,
  nickname: string
): Promise<Player | null> {
  try {
    // Path to the player node
    const playerRef = ref(
      db,
      `${DATABASE.LOBBY}/${lobbyCode}/${DATABASE.PLAYERS}/${uid}`
    );

    const playerData = PlayerSchema.parse({
      uid,
      nickname,
      joinDate: new Date().toISOString(),
      score: 0,
      streak: 0,
    });

    await set(playerRef, playerData);
    await updateLobbyTime(lobbyCode);
    return playerData;
  } catch (error) {
    console.error("Error adding player:", error);
    return null;
  }
}

function generateLobbyCode(length = 4) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // avoid ambiguous chars
  let code = "";
  for (let i = 0; i < length; i++)
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export async function generateUniqueLobbyCode(tries = 6) {
  for (let i = 0; i < tries; i++) {
    const code = generateLobbyCode();
    const snap = await get(ref(db, `${DATABASE.LOBBY}/${code}`));
    if (!snap.exists()) return code;
  }
  // fallback to uuid if unlucky
  return uuidv4().slice(0, 8).toUpperCase();
}

// Merge GameAuthor -> GameRuntime: assign question ids, fill effective options/timeLimit
export function createRuntimeGame(authorGame: GameAuthor): GameRuntime {
  const runtimeQuestions: QuestionRuntime[] = authorGame.questions.map(
    (qAuthor) => {
      // id
      const id = uuidv4();

      // effective timeLimit: per-question override else game default else undefined
      const timeLimit = qAuthor.timeLimit ?? authorGame.defaultTimeLimit ?? 30;
      const doublePoints = qAuthor.doublePoints ?? false;

      // Build runtime question (preserve display fields)
      const runtimeQ = {
        ...qAuthor,
        id,
        timeLimit,
        playerAnswers: {},
        doublePoints: doublePoints,
      } as QuestionRuntime;

      return runtimeQ;
    }
  );

  const runtimeGame: GameRuntime = {
    ...authorGame,
    questions: runtimeQuestions,
  };

  return runtimeGame;
}

export async function createLobby(
  lobby: Lobby,
  lobbyCode: string
): Promise<boolean> {
  try {
    await set(ref(db, `${DATABASE.LOBBY}/${lobbyCode}`), lobby);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function removeLobby(lobbyCode: string): Promise<void> {
  try {
    await remove(ref(db, `${DATABASE.LOBBY}/${lobbyCode}`));
  } catch (error) {
    console.error(error);
  }
}

export async function removePlayerFromLobby(
  lobbyCode: string,
  playerId: string
): Promise<void> {
  try {
    await remove(
      ref(db, `${DATABASE.LOBBY}/${lobbyCode}/${DATABASE.PLAYERS}/${playerId}`)
    );
    await updateLobbyTime(lobbyCode);
  } catch (error) {
    console.error(error);
  }
}

async function updateLobbyTime(lobbyCode: string) {
  await update(ref(db, `${DATABASE.LOBBY}/${lobbyCode}`), {
    lastUpdated: new Date().toISOString(),
  });
}

export async function cleanStaleLobbies() {
  const snapshot = await get(ref(db, DATABASE.LOBBY));
  if (!snapshot.exists()) return;

  const now = Date.now();
  const updates: Record<string, null> = {};
  let count = 0;

  snapshot.forEach((child) => {
    const lobby = child.val();
    const last = new Date(lobby.lastActivityTime ?? lobby.startTime).getTime();

    if (now - last > 24 * 60 * 60 * 1000) {
      updates[`${DATABASE.LOBBY}/${child.key}`] = null; // Setting to null deletes it
      count++;
    }
  });

  if (count > 0) {
    await update(ref(db), updates);
    console.log(`Cleaned up ${count} stale lobbies.`);
  }
}
