import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCqwv6MBMbIs4PV44A72AG5jOe5W3FydgA",
  authDomain: "keystone-21811.firebaseapp.com",
  projectId: "keystone-21811",
  storageBucket: "keystone-21811.firebasestorage.app",
  messagingSenderId: "983108082020",
  appId: "1:983108082020:web:f72b5773467068b9b48271",
  measurementId: "G-1TXFYSVN1F",
  databaseURL: "https://keystone-21811-default-rtdb.firebaseio.com",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getDatabase(app);

let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, analytics };
