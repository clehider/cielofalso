import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAe3GGXpU-PoeYhCZyrQ_o7i4ozipu25L8",
  authDomain: "webcoonsbolivia.firebaseapp.com",
  projectId: "webcoonsbolivia",
  storageBucket: "webcoonsbolivia.firebasestorage.app",
  messagingSenderId: "495512695633",
  appId: "1:495512695633:web:da3fc06dbf212046651970"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
