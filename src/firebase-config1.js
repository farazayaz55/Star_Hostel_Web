/* eslint-disable import/prefer-default-export */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const db = initializeFirestore(app, {
//   experimentalForceLongPolling: true,
//   useFetchStreams: false,
// });
