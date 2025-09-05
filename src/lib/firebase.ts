
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "uvumbuzi-digital-hub",
  appId: "1:361125720929:web:3eb22f4460fafbd4500b20",
  storageBucket: "uvumbuzi-digital-hub.appspot.com",
  apiKey: "AIzaSyBcLJKE7kU_d78iIMlyAv-f9GskXRtzQkE",
  authDomain: "uvumbuzicommunity.org",
  messagingSenderId: "361125720929",
};

// Dynamically set authDomain based on environment
if (typeof window !== 'undefined' && window.location.hostname !== 'uvumbuzicommunity.org') {
    firebaseConfig.authDomain = 'uvumbuzi-digital-hub.firebaseapp.com';
}


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}


const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
