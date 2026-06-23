import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Keep it safe in case of empty configs or compile-time missing pieces
const config = {
  apiKey: firebaseConfig.apiKey || "",
  authDomain: firebaseConfig.authDomain || "",
  projectId: firebaseConfig.projectId || "",
  storageBucket: firebaseConfig.storageBucket || "",
  messagingSenderId: firebaseConfig.messagingSenderId || "",
  appId: firebaseConfig.appId || ""
};

const app = getApps().length === 0 ? initializeApp(config) : getApp();
const auth = getAuth(app);

// Initialize with custom firestoreDatabaseId if configured
const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || "(default)");

export { app, auth, db };
