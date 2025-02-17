// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAe3GGXpU-PoeYhCZyrQ_o7i4ozipu25L8",
  authDomain: "webcoonsbolivia.firebaseapp.com",
  databaseURL: "https://webcoonsbolivia-default-rtdb.firebaseio.com",
  projectId: "webcoonsbolivia",
  storageBucket: "webcoonsbolivia.firebasestorage.app",
  messagingSenderId: "495512695633",
  appId: "1:495512695633:web:da3fc06dbf212046651970"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
