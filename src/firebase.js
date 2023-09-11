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

  apiKey: "AIzaSyAFtSlj51Or5rOgzHcrZMpkmAmFSIXMngU",
  authDomain: "tipleaf-c4072.firebaseapp.com",
  projectId: "tipleaf-c4072",
  storageBucket: "tipleaf-c4072.appspot.com",
  messagingSenderId: "1046264565776",
  appId: "1:1046264565776:web:fffb9b33c6193a36c43a95"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);