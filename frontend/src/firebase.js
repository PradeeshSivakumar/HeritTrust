import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDWb5qs7tTI5lIoN65n4y-0WYXO8fx9W7c",
    authDomain: "herittrust-608eb.firebaseapp.com",
    projectId: "herittrust-608eb",
    storageBucket: "herittrust-608eb.firebasestorage.app",
    messagingSenderId: "901272088982",
    appId: "1:901272088982:web:7f0ffe76c9b5660676edb7",
    measurementId: "G-7VZZS3Y0ZC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

export { db, auth, googleProvider, analytics };
