import { ref, get, child, push, set } from "firebase/database";
import { db } from "./firebase";
import { DATABASE } from "./constants";
import { PlayerSchema, type Player } from "../common/types";

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

    console.log("Player added:", playerRef.key);
    return playerData;
  } catch (error) {
    console.error("Error adding player:", error);
    return null;
  }
}
