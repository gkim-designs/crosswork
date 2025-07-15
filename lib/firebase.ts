// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp  } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB996m_xHqHA8nBIHJC26FpV_81vNvUXck",
  authDomain: "crosswork-f5903.firebaseapp.com",
  projectId: "crosswork-f5903",
  storageBucket: "crosswork-f5903.appspot.com",
  messagingSenderId: "3682940835",
  appId: "1:3682940835:web:a7d5a6823b9727ac0f8c16",
  measurementId: "G-3ZK7H13KQS"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const logout = () => signOut(auth);
export { app };

let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

