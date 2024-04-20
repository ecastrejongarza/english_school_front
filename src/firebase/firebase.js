// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAG5FzcvK17BmWqwuICmpQg_DkQ8Af8CYM",
  authDomain: "escuelaingles-5da79.firebaseapp.com",
  projectId: "escuelaingles-5da79",
  storageBucket: "escuelaingles-5da79.appspot.com",
  messagingSenderId: "908653327740",
  appId: "1:908653327740:web:6dbb16964db1be043aa0f9",
  measurementId: "G-JKRE8SWF55",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

export { app, auth };
