// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  // apiKey: {/*Enter your own apikey*/},
  // authDomain: {/*Enter your own authDomain*/},
  // projectId: {/*Enter your own projectId*/},
  // storageBucket: {/*Enter your own storageBucket*/},
  // messagingSenderId: {/*Enter your own messagingSenderId*/},
  // appId: {/*Enter your own appId*/}
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
