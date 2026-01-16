import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  type User,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import type { Player } from "../common/types";
import { getTestingHost } from "../testing/index";
import { TESTING_LOBBY_CODE } from "../testing/constants";

type AppUser = {
  uid: string;
  isHost?: boolean;
  lobbyCode?: string;
  playerData?: Player; // optional full player info
};

type UserContextType = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  setAppUser: (user: AppUser) => void;
};

const UserContext = createContext<UserContextType>({
  firebaseUser: null,
  appUser: null,
  setAppUser: () => {},
});

const useTestingData = true;

export function UserProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    console.log("UserProvider mounted"); // <- this will always log
    signInAnonymously(auth)
      .then(() => console.log("Signed in anonymously"))
      .catch((err) => console.error("Sign-in error:", err));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        if (useTestingData) {
          setAppUser({
            uid: user.uid,
            isHost: true,
            lobbyCode: TESTING_LOBBY_CODE,
            playerData: getTestingHost(user.uid),
          });
        } else {
          setAppUser((prev) => prev ?? { uid: user.uid });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ firebaseUser, appUser, setAppUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
