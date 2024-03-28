import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyApE6vQq7d0OebPB0FVdq_yCqJ_WBHAnIc",
  authDomain: "starhostelboys.firebaseapp.com",
  projectId: "starhostelboys",
  storageBucket: "starhostelboys.appspot.com",
  messagingSenderId: "755178840632",
  appId: "1:755178840632:web:11a6eca3ee93f75314fccd",
  measurementId: "G-Z6KLJMC6MB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage=getStorage(app)