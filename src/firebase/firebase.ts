// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPsqb3j0DJ2msY-N0eXi8MBNojulL6Zl8",
  authDomain: "trivia-c31be.firebaseapp.com",
  databaseURL: "https://trivia-c31be-default-rtdb.firebaseio.com",
  projectId: "trivia-c31be",
  storageBucket: "trivia-c31be.firebasestorage.app",
  messagingSenderId: "200177927681",
  appId: "1:200177927681:web:099e93f7968ce9ef16e200",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const auth = getAuth(app);
