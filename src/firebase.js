import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJgeFNyTQbcxp-InBxuV7MAc50VHlTMLE",
  authDomain: "mychat-clone-eda04.firebaseapp.com",
  projectId: "mychat-clone-eda04",
  storageBucket: "mychat-clone-eda04.firebasestorage.app",
  messagingSenderId: "269069931410",
  appId: "1:269069931410:web:4fd7e14e88010fab33674b",
  measurementId: "G-42FQZNRVL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth,db}