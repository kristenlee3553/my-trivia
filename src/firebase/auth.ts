import { signInAnonymously } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Returns user id
 */
export async function signUserAnonymously() {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log("Signed in with UID:", userCredential.user.uid);
    return userCredential.user.uid;
  } catch (error) {
    console.error("Auth error:", error);
  }
}
