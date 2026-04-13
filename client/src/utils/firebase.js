// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "interview-iq-d20bb.firebaseapp.com",
  projectId: "interview-iq-d20bb",
  storageBucket: "interview-iq-d20bb.firebasestorage.app",
  messagingSenderId: "617787070869",
  appId: "1:617787070869:web:3d52299b05279fd54dbe9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider=new GoogleAuthProvider()


export {auth,provider}
